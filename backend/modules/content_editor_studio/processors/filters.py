from PIL import ImageEnhance, ImageFilter


def apply_brightness(image, factor=1.0):
    """
    Brightness:
    1 = original
    >1 brighter
    <1 darker
    """
    enhancer = ImageEnhance.Brightness(image)
    return enhancer.enhance(factor)


def apply_contrast(image, factor=1.0):
    """
    Contrast:
    1 = original
    """
    enhancer = ImageEnhance.Contrast(image)
    return enhancer.enhance(factor)


def apply_blur(image, radius=2):
    """
    Blur image
    """
    return image.filter(ImageFilter.GaussianBlur(radius))