#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
import sys


site_root = Path(".").resolve()


def canonical_page_path(path, root):
    parts = urlsplit(path)
    if not parts.path.endswith("/") or parts.path == "/":
        return None
    page = Path(root, parts.path.lstrip("/")).with_suffix(".html")
    if page.is_file():
        return urlunsplit(("", "", parts.path.rstrip("/"), parts.query, ""))
    return None


def resolve_preview_path(translated):
    translated = Path(translated)
    if translated.exists() and not translated.is_dir():
        return translated
    html_page = translated.with_suffix(".html")
    if not translated.suffix and html_page.is_file():
        return html_page
    return translated


class QuartzPreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(site_root), **kwargs)

    def translate_path(self, path):
        return str(resolve_preview_path(super().translate_path(path)))

    def do_GET(self):
        canonical = canonical_page_path(self.path, site_root)
        if canonical:
            self.send_response(308)
            self.send_header("Location", canonical)
            self.end_headers()
            return
        super().do_GET()


if __name__ == "__main__":
    site_root = Path(sys.argv[1]).resolve()
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 4173
    ThreadingHTTPServer(("127.0.0.1", port), QuartzPreviewHandler).serve_forever()
