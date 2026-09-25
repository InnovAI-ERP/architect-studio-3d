import http.server
import socketserver
import os
import sys

PORT = 8088
DIRECTORY = "/Users/grupoinnovai/architect-studio-3d"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Architect Studio server running at http://localhost:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()
