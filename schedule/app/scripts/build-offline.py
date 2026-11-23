"""Build a double-clickable, fully self-contained HTML copy of the planner."""

from __future__ import annotations

import base64
import html as html_lib
import mimetypes
import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUTPUT = DIST / "Grade 6 Weekly Planner.html"


def resolve_asset(reference: str, relative_to: Path) -> Path:
    clean_reference = html_lib.unescape(reference).split("#", 1)[0].split("?", 1)[0]
    candidate = (relative_to / unquote(clean_reference)).resolve()
    if not candidate.is_relative_to(DIST.resolve()) or not candidate.is_file():
        raise FileNotFoundError(f"Cannot inline asset: {reference}")
    return candidate


def as_data_uri(path: Path) -> str:
    mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def inline_font_urls(css: str, css_path: Path) -> str:
    def replace(match: re.Match[str]) -> str:
        quote, reference = match.group(1), match.group(2).strip()
        if reference.startswith(("data:", "http:", "https:", "blob:", "#")):
            return match.group(0)
        asset = resolve_asset(reference, css_path.parent)
        return f"url({quote}{as_data_uri(asset)}{quote})"

    return re.sub(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", replace, css)


def build() -> None:
    source = DIST / "index.html"
    page = source.read_text(encoding="utf-8")

    def replace_stylesheet(match: re.Match[str]) -> str:
        tag = match.group(0)
        href_match = re.search(r'href="([^"]+)"', tag)
        if not href_match:
            raise ValueError(f"Stylesheet has no href: {tag}")
        css_path = resolve_asset(href_match.group(1), DIST)
        css = inline_font_urls(css_path.read_text(encoding="utf-8"), css_path)
        css = re.sub(r"</style", r"<\/style", css, flags=re.IGNORECASE)
        return f"<style>\n{css}\n</style>"

    page = re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>', replace_stylesheet, page)

    def replace_module(match: re.Match[str]) -> str:
        js_path = resolve_asset(match.group(1), DIST)
        javascript = js_path.read_text(encoding="utf-8")
        javascript = re.sub(r"</script", r"<\/script", javascript, flags=re.IGNORECASE)
        return f'<script type="module">\n{javascript}\n</script>'

    page = re.sub(
        r'<script\b(?=[^>]*type="module")[^>]*\bsrc="([^"]+)"[^>]*>\s*</script>',
        replace_module,
        page,
    )

    # Service workers and web app manifests require HTTP(S), not file://.
    page = re.sub(r'<script\b[^>]*id="vite-plugin-pwa:register-sw"[^>]*>\s*</script>', "", page)
    page = re.sub(r'<link\b[^>]*rel="manifest"[^>]*>', "", page)

    def replace_icon(match: re.Match[str]) -> str:
        tag = match.group(0)
        href_match = re.search(r'href="([^"]+)"', tag)
        if not href_match:
            return tag
        icon_path = resolve_asset(href_match.group(1), DIST)
        return tag.replace(href_match.group(1), as_data_uri(icon_path))

    page = re.sub(r'<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>', replace_icon, page)
    page = page.replace('<html lang="en">', '<html lang="en" data-offline="true">', 1)
    page = page.replace(
        "<head>",
        "<head>\n    <!-- Self-contained offline edition: no server, installation, or network required. -->",
        1,
    )

    if re.search(r'<script\b[^>]*\bsrc=', page):
        raise RuntimeError("Offline build still contains an external script")
    if re.search(r'<link\b[^>]*rel="(?:stylesheet|manifest)"', page):
        raise RuntimeError("Offline build still contains an external stylesheet or manifest")
    if "vite-plugin-pwa:register-sw" in page:
        raise RuntimeError("Offline build still contains service-worker registration")

    OUTPUT.write_text(page, encoding="utf-8")
    print(f"Offline planner: {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
