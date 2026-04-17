import requests
from io import BytesIO
from PIL import Image


def draw_image_element(canvas, element):
    """
    Overlay an image element onto the canvas.
    Handles resize, opacity, and rotation.
    """
    content = element.get("content", {})
    style   = element.get("style", {})
    url     = content.get("url")

    if not url:
        return canvas

    x        = int(element.get("x", 0))
    y        = int(element.get("y", 0))
    width    = int(element.get("width", 100))
    height   = int(element.get("height", 100))
    rotation = element.get("rotation", 0)
    opacity  = style.get("opacity", 1)

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        overlay = Image.open(BytesIO(response.content)).convert("RGBA")
        overlay = overlay.resize((width, height), Image.Resampling.LANCZOS)

        # Apply opacity
        if opacity < 1:
            alpha = overlay.getchannel("A")
            alpha = alpha.point(lambda p: int(p * opacity))
            overlay.putalpha(alpha)

        # Apply rotation
        if rotation and rotation != 0:
            overlay = overlay.rotate(-rotation, expand=True, resample=Image.BICUBIC)

        canvas.paste(overlay, (x, y), overlay)
    except Exception as e:
        print(f"Failed to load image element {url}: {e}")
        # Skip this element if it fails instead of crashing the whole render

    return canvas