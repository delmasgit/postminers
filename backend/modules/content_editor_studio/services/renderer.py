import os
from io import BytesIO
from PIL import Image
from django.conf import settings

class CanvasRenderer:
    """
    Responsible for building the base Pillow canvas using a local background image.
    """

    def __init__(self, width, height, background_url=None):
        """
        Initialize canvas dimensions and background path.
        :param width: Target width of the canvas
        :param height: Target height of the canvas
        :param background_url: Relative path to the image in the local folder
        """
        self.width = width
        self.height = height
        self.background_url = background_url
        self.canvas = self._create_canvas()

    def _create_canvas(self):
        """
        Creates a blank transparent canvas or loads an image from a local directory.
        """
        if self.background_url:
            # Check if it's a color string (e.g., hex or rgb)
            if self.background_url.startswith('#') or self.background_url.startswith('rgb'):
                try:
                    return Image.new("RGBA", (self.width, self.height), self.background_url)
                except Exception as e:
                    print(f"Error parsing background color: {e}")
                    return Image.new("RGBA", (self.width, self.height), (255, 255, 255, 255))

            try:
                # Construct the absolute path to the image on your server
                # Example: settings.BASE_DIR + 'media/templates/image.png'
                absolute_path = os.path.join(settings.BASE_DIR, self.background_url)

                # Open the image from the local storage
                bg = Image.open(absolute_path).convert("RGBA")
                
                # Resize the background to fit the specified canvas dimensions
                bg = bg.resize((self.width, self.height))
                return bg
            
            except Exception as e:
                # If image is missing or path is wrong, fallback to a white canvas
                print(f"Error loading background image: {e}")
                return Image.new("RGBA", (self.width, self.height), (255, 255, 255, 255))

        # Create a transparent canvas if no background is provided
        return Image.new("RGBA", (self.width, self.height), (255, 255, 255, 0))

    def get_canvas(self):
        """
        Returns the final prepared canvas object.
        """
        return self.canvas