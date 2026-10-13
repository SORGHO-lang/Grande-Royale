import { useId } from "react";

type Common = { label: string; name: string; error?: string; hint?: string; required?: boolean; defaultValue?: string };

function Wrapper({ id, label, error, hint, required, children }: Common & { id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span aria-hidden="true" className="text-[#b42318]">*</span> : <span className="font-normal text-muted">(facultatif)</span>}
      </label>
      {children}
      {hint && !error ? <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function TextField(props: Common & { type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; maxLength?: number }) {
  const id = useId();
  const { name, type = "text", required, error, hint, defaultValue, autoComplete, inputMode, maxLength } = props;
  return (
    <Wrapper {...props} id={id}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="field"
      />
    </Wrapper>
  );
}

export function TextArea(props: Common & { rows?: number; maxLength?: number }) {
  const id = useId();
  const { name, required, error, hint, defaultValue, rows = 5, maxLength } = props;
  return (
    <Wrapper {...props} id={id}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="field"
      />
    </Wrapper>
  );
}

export function SelectField(props: Common & { options: { value: string; label: string }[]; placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  const id = useId();
  const { name, required, error, hint, defaultValue, options, placeholder, value, onChange } = props;
  return (
    <Wrapper {...props} id={id}>
      <select
        id={id}
        name={name}
        required={required}
        {...(value !== undefined ? { value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value) } : { defaultValue: defaultValue ?? "" })}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="field"
      >
        {placeholder ? <option value="" disabled>{placeholder}</option> : null}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrapper>
  );
}

/** Champ piège invisible + horodatage, pour filtrer les robots. */
export function AntiSpam() {
  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Ne pas remplir <input type="text" name="site_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
      <StartedAt />
    </>
  );
}

function StartedAt() {
  // Valeur fixée à l'affichage côté client (voir useStartedAt dans les formulaires).
  return <input type="hidden" name="_t" data-started-at="" />;
}
