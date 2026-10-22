#!/usr/bin/env python3
"""Generate minimal browser and bookmark icons with Pillow.

Run from any directory: python3 scripts/gen-favicon.py
Outputs: assets/img/favicon.ico, favicon.png, and apple-touch-icon.png.
"""

from pathlib import Path

from PIL import Image, ImageDraw


OUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "img"
BACKGROUND = (15, 23, 42)
INK = (237, 237, 236)


def render(size):
    """Draw a cheatsheet at high resolution for crisp, antialiased edges."""
    image = Image.new("RGB", (512, 512), BACKGROUND)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((128, 80, 384, 432), radius=32, outline=INK, width=24)
    for y, right in ((184, 320), (256, 320), (328, 280)):
        draw.line((192, y, right, y), fill=INK, width=24)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    render(32).save(OUT_DIR / "favicon.png", optimize=True)
    render(180).save(OUT_DIR / "apple-touch-icon.png", optimize=True)
    render(48).save(
        OUT_DIR / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[render(16), render(32)],
    )
    print("Wrote browser and bookmark icons to", OUT_DIR)


if __name__ == "__main__":
    main()
