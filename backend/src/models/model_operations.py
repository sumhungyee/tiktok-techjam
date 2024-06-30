from PIL import Image, ImageFile
from io import BytesIO
from rembg import remove


def get_image_bytes(image: Image) -> bytes:
    #ImageFile.LOAD_TRUNCATED_IMAGES = True
    image_byte_array = BytesIO()
    image.save(image_byte_array, format='png')
    return image_byte_array.getvalue()

def load_image_from_bytes(bytes: bytes) -> Image.Image:
    image_byte_array = BytesIO(bytes)
    return Image.open(image_byte_array)

def remove_background(input_image_bytes: bytes) -> bytes:
    input_image = load_image_from_bytes(input_image_bytes)
    output_image = remove(input_image)
    return get_image_bytes(output_image)


