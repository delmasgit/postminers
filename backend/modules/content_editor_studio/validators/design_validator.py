from rest_framework.exceptions import ValidationError
from urllib.parse import urlparse


ALLOWED_ELEMENT_TYPES = ["text", "shape", "image"]
ALLOWED_SHAPES = ["rectangle", "circle", "triangle"]


class DesignValidator:
    """
    Validates incoming design payload before rendering/saving.
    """

    @staticmethod
    def validate(payload):

        if "canvas" not in payload:
            raise ValidationError("Canvas field is required.")

        if "elements" not in payload:
            raise ValidationError("Elements field is required.")

        DesignValidator.validate_canvas(payload["canvas"])
        DesignValidator.validate_elements(payload["elements"])

        background = payload.get("background")
        if background:
            DesignValidator.validate_url(background)

        return True

    @staticmethod
    def validate_canvas(canvas):

        width = canvas.get("width")
        height = canvas.get("height")

        if not width or not height:
            raise ValidationError("Canvas width and height required.")

        if width <= 0 or height <= 0:
            raise ValidationError("Canvas size must be greater than 0.")

        if width > 5000 or height > 5000:
            raise ValidationError("Canvas too large. Max 5000x5000 allowed.")

    @staticmethod
    def validate_elements(elements):

        if not isinstance(elements, list):
            raise ValidationError("Elements must be array/list.")

        for el in elements:

            DesignValidator.validate_single_element(el)

    @staticmethod
    def validate_single_element(el):

        el_type = el.get("type")

        if el_type not in ALLOWED_ELEMENT_TYPES:
            raise ValidationError(
                f"Invalid element type '{el_type}'. Allowed: {ALLOWED_ELEMENT_TYPES}"
            )

        if "x" not in el or "y" not in el:
            raise ValidationError("Each element requires x and y coordinates.")

        if el_type == "text":
            DesignValidator.validate_text_element(el)

        elif el_type == "shape":
            DesignValidator.validate_shape_element(el)

        elif el_type == "image":
            DesignValidator.validate_image_element(el)

    @staticmethod
    def validate_text_element(el):

        content = el.get("content", {})

        if "text" not in content:
            raise ValidationError("Text element requires content.text")

    @staticmethod
    def validate_shape_element(el):

        content = el.get("content", {})

        shape = content.get("shape")

        if shape not in ALLOWED_SHAPES:
            raise ValidationError(
                f"Invalid shape '{shape}'. Allowed: {ALLOWED_SHAPES}"
            )

    @staticmethod
    def validate_image_element(el):

        content = el.get("content", {})

        url = content.get("url")

        if not url:
            raise ValidationError("Image element requires content.url")

        DesignValidator.validate_url(url)

    @staticmethod
    def validate_url(url):

        parsed = urlparse(url)

        if not parsed.scheme or not parsed.netloc:
            raise ValidationError(f"Invalid URL: {url}")