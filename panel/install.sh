#!/bin/sh
# Run once on the wall panel (the Surface), as root:  curl -fsSL https://home.jermins.com/panel/install.sh | sudo sh
# Installs the backlight helper the night screen uses, and lets Home Board's page reach it.
set -e
command -v python3 >/dev/null || apt-get install -y python3
curl -fsSL https://home.jermins.com/panel/panel-screen.py -o /usr/local/bin/panel-screen.py
chmod 755 /usr/local/bin/panel-screen.py
cat > /etc/systemd/system/panel-screen.service <<'UNIT'
[Unit]
Description=Home Board wall panel backlight switch (127.0.0.1:8399)
After=multi-user.target

[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/panel-screen.py
Restart=always

[Install]
WantedBy=multi-user.target
UNIT
# Chromium asks before a web page talks to this machine; allow it for Home Board only
mkdir -p /etc/chromium/policies/managed
cat > /etc/chromium/policies/managed/homeboard-panel.json <<'POL'
{ "LocalNetworkAccessAllowedForUrls": ["https://home.jermins.com"] }
POL
systemctl daemon-reload
systemctl enable --now panel-screen.service
sleep 1
curl -fsS http://127.0.0.1:8399/on >/dev/null && echo "Backlight helper is running. Restart the panel (sudo reboot) so Chromium picks up the new setting."
