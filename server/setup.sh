#!/usr/bin/env bash
# Home Board server setup: PocketBase + Caddy (automatic HTTPS) + firewall + auto-deploy from GitHub.
# For a fresh Ubuntu 24.04 server. Run once as root:
#
#   curl -fsSL https://raw.githubusercontent.com/crimdow/home-board/main/server/setup.sh | DOMAIN=board.example.com bash
#
# DOMAIN is optional: leave it out to start on plain http://<server-ip> and run the script again
# with DOMAIN=... once your domain points at the server. Running it again is safe.
set -euo pipefail

DOMAIN="${DOMAIN:-}"
REPO="${REPO:-https://github.com/crimdow/home-board.git}"
BRANCH="${BRANCH:-main}"
PB_VERSION="${PB_VERSION:-0.40.3}"
BASE=/srv/home-board
SITE=$BASE/site
DATA=$BASE/pb_data

say() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run this as root."; exit 1; }

say "Updating the system and installing tools"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get upgrade -yq
apt-get install -yq curl git unzip ufw unattended-upgrades debian-keyring debian-archive-keyring apt-transport-https gnupg

say "Turning on automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

say "Creating the 'homeboard' service account"
id homeboard >/dev/null 2>&1 || useradd --system --home "$BASE" --shell /usr/sbin/nologin homeboard
mkdir -p "$BASE" "$DATA"

say "Installing PocketBase $PB_VERSION"
case "$(uname -m)" in x86_64) ARCH=amd64 ;; aarch64|arm64) ARCH=arm64 ;; *) echo "Unsupported CPU $(uname -m)"; exit 1 ;; esac
if [ ! -x /opt/pocketbase/pocketbase ] || ! /opt/pocketbase/pocketbase --version | grep -q "$PB_VERSION"; then
  mkdir -p /opt/pocketbase && cd /tmp
  curl -fsSL -o pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${ARCH}.zip"
  unzip -oq pb.zip pocketbase -d /opt/pocketbase && rm pb.zip
  chmod 755 /opt/pocketbase/pocketbase
fi

say "Getting the app from GitHub"
if [ -d "$SITE/.git" ]; then git -C "$SITE" pull --ff-only -q; else git clone -q --branch "$BRANCH" "$REPO" "$SITE"; fi
chown -R homeboard:homeboard "$BASE"
git config --system --add safe.directory "$SITE" 2>/dev/null || true

say "Setting up the PocketBase service"
cat > /etc/systemd/system/pocketbase.service <<EOF
[Unit]
Description=Home Board (PocketBase)
After=network.target

[Service]
User=homeboard
Group=homeboard
WorkingDirectory=$BASE
ExecStart=/opt/pocketbase/pocketbase serve --http 127.0.0.1:8090 --dir $DATA --publicDir $SITE --migrationsDir $SITE/server/pb_migrations --automigrate=false --hooksDir $SITE/server/pb_hooks
Restart=always
RestartSec=3
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now pocketbase
systemctl restart pocketbase

say "Auto-deploy: check GitHub for changes every minute"
cat > /usr/local/bin/home-board-deploy <<EOF
#!/usr/bin/env bash
# Pull the latest app from GitHub. Page and hook changes go live by themselves;
# a new database migration needs a PocketBase restart, so do that when one arrives.
set -e
cd $SITE
before=\$(git rev-parse HEAD)
sudo -u homeboard git pull --ff-only -q
after=\$(git rev-parse HEAD)
if [ "\$before" != "\$after" ] && git diff --name-only "\$before" "\$after" | grep -q '^server/pb_migrations/'; then
  systemctl restart pocketbase
fi
EOF
chmod 755 /usr/local/bin/home-board-deploy
cat > /etc/systemd/system/home-board-deploy.service <<'EOF'
[Unit]
Description=Pull Home Board from GitHub
[Service]
Type=oneshot
ExecStart=/usr/local/bin/home-board-deploy
EOF
cat > /etc/systemd/system/home-board-deploy.timer <<'EOF'
[Unit]
Description=Pull Home Board from GitHub every minute
[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now home-board-deploy.timer

say "Installing Caddy (web server with automatic HTTPS)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -yq caddy
fi
SITE_ADDR="${DOMAIN:-:80}"
cat > /etc/caddy/Caddyfile <<EOF
# Home Board. With a domain name here, Caddy gets and renews the HTTPS certificate by itself.
$SITE_ADDR {
	encode zstd gzip
	# keep the repo's housekeeping files private
	@private path /.git /.git/* /server /server/* /.github/*
	respond @private 404
	reverse_proxy 127.0.0.1:8090
}
EOF
systemctl enable caddy >/dev/null 2>&1 || true
systemctl reload caddy || systemctl restart caddy

say "Firewall: only SSH, web (80) and secure web (443)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow 443/udp >/dev/null
ufw --force enable >/dev/null

say "SSH: keys only, no passwords"
if [ -s /root/.ssh/authorized_keys ]; then
  cat > /etc/ssh/sshd_config.d/99-home-board.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
  # Ubuntu 24.04 starts sshd per connection (ssh.socket), so new logins pick this up by themselves
  systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || true
  echo "Password logins are now off (your SSH key still works)."
else
  echo "SKIPPED: this server has no SSH key for root yet, so password login stays on for now."
  echo "Add your key (Hetzner: add it when creating the server), then run this script again."
fi

say "PocketBase admin account"
ADMIN_FILE=/root/home-board-admin.txt
if [ ! -f "$ADMIN_FILE" ]; then
  ADMIN_EMAIL="${ADMIN_EMAIL:-admin@home-board.local}"
  ADMIN_PASS="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24)"
  sleep 3
  if ! sudo -u homeboard /opt/pocketbase/pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASS" --dir "$DATA" \
       --migrationsDir "$SITE/server/pb_migrations" --hooksDir "$SITE/server/pb_hooks"; then
    echo "Couldn't create the dashboard login. Check: journalctl -u pocketbase -n 30"; exit 1
  fi
  printf 'PocketBase dashboard login\nemail: %s\npassword: %s\n' "$ADMIN_EMAIL" "$ADMIN_PASS" > "$ADMIN_FILE"
  chmod 600 "$ADMIN_FILE"
fi

IP="$(curl -fsS4 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')"
URL="${DOMAIN:+https://$DOMAIN}"; URL="${URL:-http://$IP}"
say "All set"
echo "App:        $URL"
echo "Dashboard:  $URL/_/"
cat "$ADMIN_FILE"
echo "(saved on the server in $ADMIN_FILE; save it in your password manager)"
echo
echo "Next: in the dashboard, add the household logins (Collections → users → New record,"
echo "role = editor) and the friend login (role = viewer)."
