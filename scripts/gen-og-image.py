#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph image for Ultimate Cheatsheet for Developers.

Deterministic given the same installed TrueType fonts: no randomness and no
timestamps, so a fixed input set yields byte-identical output on every run.
Fonts are resolved from fixed candidate lists; if none is found, the script
errors instead of falling back to Pillow's low-resolution default.

Run from the repository root:
    python3 scripts/gen-og-image.py
Output: assets/img/og-image.png
"""

import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont


W, H = 1200, 630
BG = (15, 23, 42)
PANEL = (31, 41, 55)
BORDER = (62, 62, 58)
ACCENT = (6, 182, 212)
ACCENT_LIGHT = (103, 232, 249)
INK = (237, 237, 236)
MUTED = (156, 163, 175)
RED = (255, 95, 86)
YELLOW = (255, 189, 46)
GREEN = (39, 201, 63)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(PROJECT_ROOT, "assets", "img", "og-image.png")


def load_font(size, monospace=False):
    """Load a bold TrueType font from a fixed candidate list."""
    if monospace:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
            "/usr/share/fonts/dejavu/DejaVuSansMono-Bold.ttf",
        ]
    else:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
        ]

    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)

    kind = "bold monospace" if monospace else "bold sans"
    raise RuntimeError(
        "No " + kind + " TrueType font found; looked in:\n  "
        + "\n  ".join(candidates)
    )


def centered_x(draw, text, font):
    """Return the x coordinate that horizontally centers text."""
    bbox = draw.textbbox((0, 0), text, font=font)

    return (W - (bbox[2] - bbox[0])) // 2 - bbox[0]


def render_logo(size):
    """Render a ruled cheatsheet page as a neon outline."""
    scale = 4
    canvas_size = size * scale

    def unit(value):
        return value * canvas_size // 200

    mark = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    mark_draw = ImageDraw.Draw(mark)
    mark_draw.rounded_rectangle(
        [unit(34), unit(18), unit(166), unit(182)],
        radius=unit(22),
        outline=INK + (255,),
        width=5 * scale,
    )
    for y, right in ((72, 138), (108, 138), (144, 110)):
        mark_draw.line(
            [(unit(62), unit(y)), (unit(right), unit(y))],
            fill=INK + (255,),
            width=5 * scale,
        )

    mark = mark.resize((size, size), Image.Resampling.LANCZOS)
    glow_alpha = mark.getchannel("A").filter(ImageFilter.GaussianBlur(7))
    glow = Image.new("RGBA", (size, size), ACCENT_LIGHT + (0,))
    glow.putalpha(glow_alpha.point(lambda alpha: alpha * 2 // 3))

    return Image.alpha_composite(glow, mark)


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Terminal window, kept within the central social-preview safe zone.
    left, top, right, bottom = 180, 62, 1020, 350
    draw.rounded_rectangle(
        [left, top, right, bottom], radius=26, fill=PANEL, outline=BORDER, width=3
    )
    draw.line([left, top + 62, right, top + 62], fill=BORDER, width=3)

    dot_y = top + 31
    for dot_x, color in ((left + 34, RED), (left + 67, YELLOW), (left + 100, GREEN)):
        draw.ellipse([dot_x - 9, dot_y - 9, dot_x + 9, dot_y + 9], fill=color)

    logo = render_logo(158)
    logo_x = left + 92
    logo_y = top + 91
    img.paste(logo, (logo_x, logo_y), logo)

    mono = load_font(30, monospace=True)
    draw.text(
        (left + 285, top + 120),
        "npx ucheat git stash",
        font=mono,
        fill=INK,
    )

    small_mono = load_font(28, monospace=True)
    draw.text(
        (left + 285, top + 184),
        "> straight from your terminal",
        font=small_mono,
        fill=MUTED,
    )

    title_font = load_font(82)
    title = "Ultimate Cheatsheet"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_y = 390 - title_bbox[1]
    draw.text(
        (centered_x(draw, title, title_font), title_y),
        title,
        font=title_font,
        fill=INK,
    )

    tagline_font = load_font(40)
    tagline = "Making everyday development easier."
    tagline_bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tagline_y = 500 - tagline_bbox[1]
    draw.text(
        (centered_x(draw, tagline, tagline_font), tagline_y),
        tagline,
        font=tagline_font,
        fill=ACCENT_LIGHT,
    )

    # A subtle brand underline anchors the composition.
    underline_width = 310
    underline_left = (W - underline_width) // 2
    draw.rounded_rectangle(
        [underline_left, 570, underline_left + underline_width, 577],
        radius=4,
        fill=ACCENT,
    )

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    img.save(OUT_PATH, "PNG", optimize=True)
    print("wrote", OUT_PATH, img.size)


if __name__ == "__main__":
    main()
