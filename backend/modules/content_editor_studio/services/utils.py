import os
import uuid
from PIL import ImageColor


def hex_to_rgba(hex_color, opacity=1.0):
    """
    Convert HEX color to RGBA tuple
    Example: #ff0000 → (255,0,0,255)
    """
    rgb = ImageColor.getrgb(hex_color)
    alpha = int(255 * opacity)
    return (*rgb, alpha)


def generate_output_filename():
    """
    Generate unique output filename
    """
    return f"{uuid.uuid4()}.png"


def ensure_directory(path):
    """
    Create directory if not exists
    """
    if not os.path.exists(path):
        os.makedirs(path)