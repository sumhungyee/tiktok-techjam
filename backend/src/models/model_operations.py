import PIL
from PIL import Image
from io import BytesIO


def get_image_bytes(image: PIL.Image) -> bytes:
    image_byte_array = BytesIO()
    image.save(image_byte_array, format='png')
    return image_byte_array.getvalue()

def load_image_from_bytes(bytes: bytes) -> PIL.Image:
    image_byte_array = BytesIO(bytes)
    return Image.open(image_byte_array)