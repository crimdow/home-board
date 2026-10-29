#!/usr/bin/env python3
"""Backlight switch for the Home Board wall panel (the Surface).

Home Board's night screen calls http://127.0.0.1:8399/off, and /on when someone taps it or morning comes.
It only listens on this machine. Runs as root (the backlight file needs it) from panel-screen.service.
"""
import glob, http.server, os

DEV = os.environ.get("PANEL_BACKLIGHT") or (glob.glob("/sys/class/backlight/intel_backlight") or glob.glob("/sys/class/backlight/*"))[0]
SAVE = os.environ.get("PANEL_SAVE", "/var/lib/panel-screen-level")

def read(name):
    with open(os.path.join(DEV, name)) as f:
        return int(f.read().strip())

def write(name, value):
    with open(os.path.join(DEV, name), "w") as f:
        f.write(str(value))

def screen(lit):
    if lit:
        try:
            level = int(open(SAVE).read().strip())
        except Exception:
            level = 0
        if level <= 0:
            level = max(1, read("max_brightness") * 6 // 10)
        if read("brightness") == 0:
            write("brightness", level)
    else:
        now = read("brightness")
        if now > 0:
            with open(SAVE, "w") as f:
                f.write(str(now))
            write("brightness", 0)

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/on", "/off"):
            try:
                screen(path == "/on")
                code = 200
            except Exception:
                code = 500
        else:
            code = 404
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.end_headers()

    def log_message(self, *args):
        pass

if __name__ == "__main__":
    screen(True)   # never start with the screen dark
    http.server.ThreadingHTTPServer(("127.0.0.1", 8399), Handler).serve_forever()
