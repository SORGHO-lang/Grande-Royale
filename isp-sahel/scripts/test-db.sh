#!/usr/bin/env bash
# Applique migrations + seed sur un PostgreSQL local jetable et exécute les tests RLS.
# Prérequis : binaires PostgreSQL (initdb, pg_ctl, psql). Usage : bash scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN="${PGBIN:-$(dirname "$(command -v initdb 2>/dev/null || ls /usr/lib/postgresql/*/bin/initdb | tail -1)")}"
DIR="$(mktemp -d)"
PORT="${PGPORT_TEST:-54329}"
trap '"$PGBIN/pg_ctl" -D "$DIR" stop -m fast >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT

if [ "$(id -u)" = "0" ]; then
  chown -R postgres "$DIR"; RUN="runuser -u postgres --"
else RUN=""; fi

$RUN "$PGBIN/initdb" -D "$DIR" -U postgres -A trust >/dev/null
$RUN "$PGBIN/pg_ctl" -D "$DIR" -o "-p $PORT -k $DIR -c listen_addresses=''" -l "$DIR/log" start >/dev/null
PSQL=(psql -h "$DIR" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q)

"${PSQL[@]}" -f tests/db/supabase-stubs.sql
for f in supabase/migrations/*.sql; do echo "→ migration $f"; "${PSQL[@]}" -f "$f"; done
echo "→ seed"; "${PSQL[@]}" -f supabase/seed.sql
echo "→ seed (2e passage, idempotence)"; "${PSQL[@]}" -f supabase/seed.sql
"${PSQL[@]}" -c "grant all on all tables in schema public to anon, authenticated, service_role;"
"${PSQL[@]}" -f tests/db/rls.sql
