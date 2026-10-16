#!/usr/bin/env bash
set -Eeuo pipefail

for name in DEPLOY_HOST DEPLOY_USER DEPLOY_SSH_KEY DEPLOY_SSH_HOST_PUBLIC_KEY DEPLOY_PATH; do
  if [[ -z "${!name:-}" ]]; then
    printf 'Missing GitHub Actions secret: %s\n' "$name" >&2
    exit 1
  fi
done
if [[ ! "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] ||
   [[ ! "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*\$?$ ]]; then
  echo 'DEPLOY_HOST must be a hostname/IPv4 address and DEPLOY_USER a Linux username.' >&2
  exit 1
fi
port="${DEPLOY_PORT:-22}"
if [[ ! "$port" =~ ^[0-9]{1,5}$ ]] || (( 10#$port < 1 || 10#$port > 65535 )); then
  echo 'DEPLOY_PORT must be between 1 and 65535.' >&2
  exit 1
fi
port="$((10#$port))"
if [[ ! "$DEPLOY_PATH" =~ ^(/[a-zA-Z0-9_.-]+)+/?$ ]] ||
   [[ "$DEPLOY_PATH" =~ (^|/)\.{1,2}(/|$) ]]; then
  echo 'DEPLOY_PATH must be an absolute directory path without spaces, shell characters or dot segments.' >&2
  exit 1
fi

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$root/.tmp/site"
deploy_path="${DEPLOY_PATH%/}"
if [[ ! -s "$source_dir/index.html" || ! -s "$source_dir/api/v1/catalog.json" ]]; then
  echo 'Missing staged site. Run node tools/package-site.mjs first.' >&2
  exit 1
fi

umask 077
ssh_dir="$(mktemp -d)"
trap 'rm -rf -- "$ssh_dir"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" | tr -d '\r' > "$ssh_dir/key"
ssh-keygen -y -P '' -f "$ssh_dir/key" >/dev/null
# OpenSSH uses the bare host for port 22 and [host]:port for other ports.
host_entry="$DEPLOY_HOST"
if [[ "$port" != 22 ]]; then
  host_entry="[$DEPLOY_HOST]:$port"
fi
: > "$ssh_dir/known_hosts"
host_key_count=0
while IFS= read -r line; do
  line="${line//$'\r'/}"
  read -r key_type key_data _ <<< "$line"
  if [[ -z "$key_type" ]]; then continue; fi
  if [[ "$key_type" != ssh-* && "$key_type" != ecdsa-* && "$key_type" != sk-* ]]; then
    echo 'DEPLOY_SSH_HOST_PUBLIC_KEY must contain host public keys, e.g. ssh-ed25519 AAAA..., without a hostname or port.' >&2
    exit 1
  fi
  printf '%s %s\n' "$key_type" "$key_data" > "$ssh_dir/host_key"
  if ! ssh-keygen -l -f "$ssh_dir/host_key" >/dev/null 2>&1; then
    echo 'Invalid server host public key in DEPLOY_SSH_HOST_PUBLIC_KEY.' >&2
    exit 1
  fi
  printf '%s %s %s\n' "$host_entry" "$key_type" "$key_data" >> "$ssh_dir/known_hosts"
  host_key_count=$((host_key_count + 1))
done <<< "$DEPLOY_SSH_HOST_PUBLIC_KEY"
if (( host_key_count == 0 )); then
  echo 'DEPLOY_SSH_HOST_PUBLIC_KEY must contain at least one server host public key.' >&2
  exit 1
fi
export MP_DEPLOY_SSH_DIR="$ssh_dir" MP_DEPLOY_PORT="$port"
cat > "$ssh_dir/connect" <<'SH'
#!/usr/bin/env bash
exec ssh -i "$MP_DEPLOY_SSH_DIR/key" -p "$MP_DEPLOY_PORT" \
  -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o "UserKnownHostsFile=$MP_DEPLOY_SSH_DIR/known_hosts" \
  -o ConnectTimeout=20 -o ServerAliveInterval=15 -o ServerAliveCountMax=3 "$@"
SH
chmod 700 "$ssh_dir/connect"

# Upload into the configured directory, which may be a bind mount; never replace it.
"$ssh_dir/connect" "$DEPLOY_USER@$DEPLOY_HOST" \
  "test -d '$deploy_path' && test -w '$deploy_path' && command -v rsync >/dev/null"
rsync --recursive --links --times --perms --compress --delay-updates --omit-dir-times \
  --chmod=D755,F644 --exclude='.well-known/' \
  -e "$ssh_dir/connect" -- "$source_dir/" "$DEPLOY_USER@$DEPLOY_HOST:$deploy_path/"
echo 'Uploaded static files. Nginx configuration was not changed.'
