# from PIL import ImageDraw

# from apps.designs.services.utils import hex_to_rgba


# def draw_shape_element(canvas, element):
#     """
#     Draw shapes onto canvas
#     """

#     draw = ImageDraw.Draw(canvas)

#     style = element.get("style", {})
#     content = element.get("content", {})

#     shape_type = content.get("shape", "rectangle")

#     x = element.get("x", 0)
#     y = element.get("y", 0)

#     width = element.get("width", 100)
#     height = element.get("height", 100)

#     color = style.get("color", "#000000")
#     opacity = style.get("opacity", 1)

#     stroke_color = style.get("stroke_color")
#     stroke_width = style.get("stroke_width", 0)

#     fill_rgba = hex_to_rgba(color, opacity)

#     outline_rgba = None
#     if stroke_color:
#         outline_rgba = hex_to_rgba(stroke_color, opacity)

#     if shape_type == "rectangle":
#         draw.rectangle(
#             [x, y, x + width, y + height],
#             fill=fill_rgba,
#             outline=outline_rgba,
#             width=stroke_width
#         )

#     elif shape_type == "circle":
#         draw.ellipse(
#             [x, y, x + width, y + height],
#             fill=fill_rgba,
#             outline=outline_rgba,
#             width=stroke_width
#         )

#     elif shape_type == "triangle":
#         points = [
#             (x + width / 2, y),
#             (x, y + height),
#             (x + width, y + height)
#         ]

#         draw.polygon(
#             points,
#             fill=fill_rgba,
#             outline=outline_rgba
#         )

#     return canvas
from PIL import ImageDraw
import math # Added for star calculation
from modules.content_editor_studio.services.utils import hex_to_rgba

def draw_shape_element(canvas, element):
    draw = ImageDraw.Draw(canvas)

    style = element.get("style", {})
    content = element.get("content", {})
    shape_type = content.get("shape", "rectangle")

    x = element.get("x", 0)
    y = element.get("y", 0)
    width = element.get("width", 100)
    height = element.get("height", 100)

    color = style.get("color", "#000000")
    opacity = style.get("opacity", 1)
    stroke_color = style.get("stroke_color")
    stroke_width = style.get("stroke_width", 0)

    fill_rgba = hex_to_rgba(color, opacity)
    outline_rgba = hex_to_rgba(stroke_color, opacity) if stroke_color else None

    # 1. RECTANGLE
    if shape_type == "rectangle":
        draw.rectangle(
            [x, y, x + width, y + height],
            fill=fill_rgba,
            outline=outline_rgba,
            width=stroke_width
        )

    # 2. CIRCLE / ELLIPSE
    elif shape_type == "circle":
        draw.ellipse(
            [x, y, x + width, y + height],
            fill=fill_rgba,
            outline=outline_rgba,
            width=stroke_width
        )

    # 3. TRIANGLE
    elif shape_type == "triangle":
        points = [(x + width / 2, y), (x, y + height), (x + width, y + height)]
        draw.polygon(points, fill=fill_rgba, outline=outline_rgba)

    # 4. NEW: ROUNDED RECTANGLE (Very popular for buttons/cards)
    elif shape_type == "rounded_rectangle":
        radius = style.get("border_radius", 20)
        draw.rounded_rectangle(
            [x, y, x + width, y + height],
            radius=radius,
            fill=fill_rgba,
            outline=outline_rgba,
            width=stroke_width
        )

    # 5. NEW: LINE (For separators)
    elif shape_type == "line":
        draw.line(
            [x, y, x + width, y + height],
            fill=fill_rgba,
            width=max(1, stroke_width)
        )

    # 6. NEW: STAR (Complex shape example)
    elif shape_type == "star":
        points = []
        center_x, center_y = x + width / 2, y + height / 2
        outer_radius = min(width, height) / 2
        inner_radius = outer_radius / 2.5
        for i in range(10):
            angle = math.radians(i * 36 - 90)
            r = outer_radius if i % 2 == 0 else inner_radius
            points.append((center_x + r * math.cos(angle), center_y + r * math.sin(angle)))
        draw.polygon(points, fill=fill_rgba, outline=outline_rgba)

    return canvas