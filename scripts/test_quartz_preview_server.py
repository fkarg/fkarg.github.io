import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "quartz_preview_server", Path(__file__).with_name("quartz-preview-server.py")
)
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class CanonicalPagePathTests(unittest.TestCase):
    def test_redirects_page_slash_and_keeps_query(self):
        with tempfile.TemporaryDirectory() as temp:
            Path(temp, "home").mkdir()
            Path(temp, "home", "about.html").touch()
            self.assertEqual(
                server.canonical_page_path("/home/about/?q=test", temp),
                "/home/about?q=test",
            )

    def test_leaves_directory_routes_and_missing_pages_alone(self):
        with tempfile.TemporaryDirectory() as temp:
            Path(temp, "tags").mkdir()
            self.assertIsNone(server.canonical_page_path("/tags/", temp))
            self.assertIsNone(server.canonical_page_path("/missing/", temp))
            self.assertIsNone(server.canonical_page_path("/missing", temp))

    def test_extensionless_page_wins_over_an_alias_directory(self):
        with tempfile.TemporaryDirectory() as temp:
            Path(temp, "now").mkdir()
            Path(temp, "now", "index.html").touch()
            Path(temp, "now.html").touch()
            self.assertEqual(server.resolve_preview_path(Path(temp, "now")), Path(temp, "now.html"))
            self.assertEqual(server.resolve_preview_path(Path(temp, "now/")), Path(temp, "now.html"))


if __name__ == "__main__":
    unittest.main()
