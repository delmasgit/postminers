import os
import textwrap
from PIL import ImageDraw, ImageFont, Image

from django.conf import settings
from modules.content_editor_studio.services.utils import hex_to_rgba


FONT_MAP = {
    "arial":       "arial.ttf",
    "arial_bold":  "arialbd.ttf",
    "impact":      "impact.ttf",
    "georgia":     "georgia.ttf",
}

BOLD_VARIANT = {
    "arial":   "arialbd.ttf",
    "georgia": "georgiab.ttf",
}


def _load_font(family, size, weight='normal'):
    """
    Load a TrueType font.  If the bold variant is requested
    and exists on disk, use it; otherwise fall back to the
    regular weight.
    """
    if weight == 'bold' and family in BOLD_VARIANT:
        filename = BOLD_VARIANT[family]
    else:
        filename = FONT_MAP.get(family, "arial.ttf")

    font_path = os.path.join(settings.BASE_DIR, "fonts", filename)

    # Fall back to default if the file is missing
    if not os.path.isfile(font_path):
        font_path = os.path.join(settings.BASE_DIR, "fonts", "arial.ttf")

    try:
        return ImageFont.truetype(font_path, size)
    except Exception:
        # Ultimate fallback — Pillow's built-in bitmap font
        return ImageFont.load_default()


def draw_text_element(canvas, element):
    """
    Draw a text element on the canvas.
    Handles font_weight, font_style, opacity, rotation,
    and width-constrained wrapping.
    """

    style   = element.get("style", {})
    content = element.get("content", {})

    text        = content.get("text", "")
    x           = element.get("x", 0)
    y           = element.get("y", 0)
    el_width    = element.get("width", None)
    rotation    = element.get("rotation", 0)

    font_size   = style.get("font_size", 32)
    font_family = style.get("font_family", "arial")
    font_weight = style.get("font_weight", "normal")
    color       = style.get("color", "#000000")
    opacity     = style.get("opacity", 1)

    font = _load_font(font_family, font_size, font_weight)

    rgba = hex_to_rgba(color, opacity)

    # ----- Wrap text to fit inside element width -----
    if el_width and el_width > 0:
        # Estimate chars per line using average char width
        avg_char_w = font_size * 0.6
        chars_per_line = max(1, int(el_width / avg_char_w))
        text = "\n".join(textwrap.wrap(text, width=chars_per_line))

    # ----- Handle rotation -----
    if rotation and rotation != 0:
        # Render onto a transparent layer, rotate, paste
        dummy = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
        dd = ImageDraw.Draw(dummy)
        bbox = dd.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0] + 20
        th = bbox[3] - bbox[1] + 20

        txt_layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        td = ImageDraw.Draw(txt_layer)
        td.text((10, 10), text, fill=rgba, font=font)

        rotated = txt_layer.rotate(-rotation, expand=True, resample=Image.BICUBIC)

        # Paste rotated text at (x, y)
        px, py = int(x), int(y)
        canvas.paste(rotated, (px, py), rotated)
    else:
        draw = ImageDraw.Draw(canvas)
        draw.text((x, y), text, fill=rgba, font=font)

    return canvas