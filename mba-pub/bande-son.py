"""Bande-son de la pub MBA (30 s) : musique + bruitages calés sur la timeline GSAP.

Tout est synthétisé (aucun échantillon externe, donc aucun droit d'auteur).
Usage : python3 bande-son.py sortie.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

music = np.zeros(N)
sfx = np.zeros(N)


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    buf[i : i + len(sig)] += sig * gain


def filt(sig, kind, freq, order=2):
    sos = butter(order, freq, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, sig)


def env(d, attack=0.005, decay=None):
    t = t_arr(d)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    if decay is None:
        return a
    return a * np.exp(-t / decay)


def note(n):
    """Numéro MIDI → fréquence."""
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------- Instruments ----------
def kick(gain=1.0):
    t = t_arr(0.45)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.16) * gain


def clap():
    t = t_arr(0.25)
    n = rng.standard_normal(len(t))
    n = filt(n, "bandpass", [900, 3500])
    e = np.exp(-t / 0.07) + 0.6 * np.exp(-((t - 0.012) % 0.011) / 0.003) * (t < 0.035)
    return n * e * 0.9


def hat(open_=False):
    d = 0.18 if open_ else 0.05
    t = t_arr(d)
    n = filt(rng.standard_normal(len(t)), "highpass", 7000)
    return n * np.exp(-t / (0.06 if open_ else 0.015)) * 0.5


def saw(freq, d, detune=0.0):
    t = t_arr(d)
    out = np.zeros(len(t))
    for k in range(1, 14):
        out += np.sin(2 * np.pi * freq * (1 + detune) * k * t) / k
    return out * 0.6


def bass(n, d=0.24):
    s = saw(note(n), d)
    s = filt(s, "lowpass", 700)
    return s * env(d, 0.004, 0.16)


def pluck(chord, d=0.32):
    t = t_arr(d)
    out = np.zeros(len(t))
    for n in chord:
        f = note(n)
        tri = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t))
        out += tri + 0.3 * np.sin(4 * np.pi * f * t)
    return out / len(chord) * env(d, 0.003, 0.11)


def pad(chord, d, attack=0.6, release=0.8):
    t = t_arr(d)
    out = np.zeros(len(t))
    for n in chord:
        for det in (-0.004, 0.0, 0.005):
            out += saw(note(n), d, det)
    out = filt(out / (3 * len(chord)), "lowpass", 1400)
    e = np.clip(t / attack, 0, 1) * np.clip((d - t) / release, 0, 1)
    return out * e


def noise_sweep(d, f0, f1, shape="swell"):
    """Bruit filtré dont la fréquence glisse de f0 à f1 (whoosh / riser)."""
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    block = 512
    for i in range(0, len(t), block):
        f = f0 * (f1 / f0) ** (i / len(t))
        seg = n[max(0, i - 2048) : i + block]
        y = filt(seg, "bandpass", [max(40, f * 0.6), min(SR / 2 - 100, f * 1.6)])
        out[i : i + block] = y[-len(n[i : i + block]) :]
    if shape == "swell":
        e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    else:  # rise
        e = (t / d) ** 2
    return out * e


def whoosh():
    return noise_sweep(0.6, 300, 3500) * 0.7


def riser(d):
    t = t_arr(d)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * (t / d) ** 2 * 0.25
    return noise_sweep(d, 400, 6000, "rise") * 0.5 + tone


def impact():
    t = t_arr(2.0)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 90 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.45)
    crash = filt(rng.standard_normal(len(t)), "highpass", 2500) * np.exp(-t / 0.35) * 0.35
    return boom + crash


def slam():
    t = t_arr(0.4)
    body = np.sin(2 * np.pi * np.cumsum(60 + 200 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12)
    snap = filt(rng.standard_normal(len(t)), "bandpass", [1500, 6000]) * np.exp(-t / 0.03) * 0.6
    return body + snap


def rumble(d):
    t = t_arr(d)
    r = filt(rng.standard_normal(len(t)), "lowpass", 160) * 3
    return r * np.sin(np.pi * t / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * t))


def pop(f0=420, f1=1000):
    t = t_arr(0.11)
    f = f0 + (f1 - f0) * (t / 0.11) ** 0.5
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.11, 0.002, 0.04)


def bell(f, d=1.2):
    t = t_arr(d)
    out = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.5)
           + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.25)
           + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.12))
    return out * env(d, 0.002)


def tick(f=2200):
    t = t_arr(0.03)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006)


def key_click():
    t = t_arr(0.025)
    return filt(rng.standard_normal(len(t)), "bandpass", [2000, 6000]) * np.exp(-t / 0.005)


def thud():
    t = t_arr(0.3)
    return np.sin(2 * np.pi * np.cumsum(70 + 120 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.09)


# ---------- Musique ----------
BEAT = 0.5  # 120 BPM, une mesure = 2 s
PROG = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [52, 55, 60]), (55, [55, 59, 62])]  # Am F C G

# Intro (0–4 s) : nappe tendue + tic-tac d'horloge
add(music, 0.0, pad([45, 52, 57], 4.0, attack=1.2, release=0.3), 0.55)
for i in range(8):
    add(music, i * BEAT, tick(2400 if i % 2 == 0 else 1800), 0.35)
add(music, 3.0, riser(1.0), 0.9)

# Groove principal (4–28 s)
def groove(t0, t1, drums=True):
    t = t0
    while t < t1 - 1e-6:
        bar = int(round((t - 4.0) / 2.0)) % 4
        root, chord = PROG[bar]
        for b in range(4):
            tb = t + b * BEAT
            if tb >= t1 - 1e-6:
                break
            if drums:
                add(music, tb, kick(), 0.9)
                if b in (1, 3):
                    add(music, tb, clap(), 0.45)
                add(music, tb + BEAT / 2, hat(open_=(b == 3)), 0.5)
                add(music, tb, hat(), 0.25)
            for e in range(2):
                add(music, tb + e * BEAT / 2, bass(root - 12 + (12 if e == 1 else 0)), 0.45)
            add(music, tb + BEAT / 2, pluck([n + 12 for n in chord]), 0.32)
        add(music, t, pad([n + 12 for n in chord], 2.0, attack=0.3, release=0.4), 0.18)
        t += 2.0

groove(4.0, 19.5)
add(music, 19.0, riser(1.0), 0.8)        # montée avant l'engagement
groove(20.0, 28.0)
# Final (28–30 s) : accord de Do majeur tenu qui s'éteint → boucle propre
add(music, 28.0, kick(1.2), 0.9)
add(music, 28.0, pad([48, 55, 60, 64, 67], 1.95, attack=0.02, release=1.6), 0.6)
add(music, 28.0, bell(note(84), 1.9), 0.25)

# ---------- Bruitages (calés sur la timeline GSAP) ----------
for t in (0.15, 0.55):
    add(sfx, t, slam(), 0.8)
add(sfx, 1.0, slam(), 1.0)
add(sfx, 1.0, impact(), 0.5)
add(sfx, 1.6, rumble(0.6), 0.6)
add(sfx, 3.05, rumble(0.45), 0.5)
for i in range(3):
    add(sfx, 2.2 + i * 0.25, pop(500 + 120 * i, 1100 + 120 * i), 0.4)

for t in (3.7, 8.7, 10.7, 19.7, 24.7):   # volets de transition
    add(sfx, t - 0.05, whoosh(), 0.8)

add(sfx, 4.2, pop(300, 700), 0.4)
for i in range(5):                       # icônes des biens
    add(sfx, 4.5 + i * 0.55, pop(450 + 60 * i, 1050 + 90 * i), 0.6)

for t in (9.3, 9.42):                    # M et B qui tombent
    add(sfx, t + 0.2, thud(), 0.9)
add(sfx, 9.85, thud(), 1.0)              # toit du A
add(sfx, 10.1, bell(note(88), 0.9), 0.35)

for i in range(4):                       # cartes + coches
    t = 11.4 + i * 2
    add(sfx, t, noise_sweep(0.35, 2500, 600), 0.45)
    add(sfx, t + 0.6, bell(note(83 + [0, 2, 4, 7][i]), 1.0), 0.4)

add(sfx, 20.1, impact(), 1.0)            # « 0 F »
for k in range(10):                      # compteur 0 → 10 %
    tk = 21.5 + 1.1 * (1 - np.sqrt(1 - (k + 1) / 10))
    add(sfx, tk, tick(1400 + 90 * k), 0.4)
add(sfx, 22.6, bell(note(84), 1.0), 0.45)
add(sfx, 23.4, bell(note(91), 1.2), 0.4)  # « Aucune vente ? Aucun frais. »
add(sfx, 23.48, bell(note(96), 1.2), 0.3)

slogan_len = 34
for k in range(slogan_len):              # slogan qui s'écrit
    if k % 4 != 3:
        add(sfx, 25.9 + k * 1.2 / slogan_len, key_click(), 0.25)
add(sfx, 26.6, pop(300, 900), 0.6)       # bouton
for t in (27.2, 28.0, 28.8):             # pulsations du bouton
    add(sfx, t, pop(600, 750), 0.18)
for k in range(10):                      # petite sonnerie du téléphone
    tt = 27.6 + k * 0.05
    add(sfx, tt, np.sin(2 * np.pi * (1300 if k % 2 else 1650) * t_arr(0.05)) * 0.5, 0.25)

# ---------- Mixage ----------
mix = music * 0.55 + sfx * 0.75
t = np.arange(N) / SR
mix *= np.clip((DUR - t) / 0.5, 0, 1)        # fondu final (boucle)
mix *= np.clip(t / 0.02, 0, 1)
mix = np.tanh(mix * 1.4) / np.tanh(1.4)       # limiteur doux
mix = mix / np.max(np.abs(mix)) * 0.93

stereo = np.stack([mix, mix], axis=1)
pcm = (stereo * 32767).astype("<i2")
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "bande-son.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
