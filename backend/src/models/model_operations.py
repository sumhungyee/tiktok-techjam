from PIL import Image, ImageFile
from typing import Optional
from io import BytesIO
from rembg import remove


def get_image_bytes(image: Image.Image, resize: bool=False) -> bytes:
    #ImageFile.LOAD_TRUNCATED_IMAGES = True
    if resize:
        image = resize_to_max_dim(img)
    image_byte_array = BytesIO()
    image.save(image_byte_array, format='png')
    return image_byte_array.getvalue()

def load_image_from_bytes(bytes: bytes, resize: bool=False) -> Image.Image:
    image_byte_array = BytesIO(bytes)
    img = Image.open(image_byte_array)
    if resize:
        return resize_to_max_dim(img)
    return img

def remove_background(input_image_bytes: bytes, resize: bool=False, **kwargs: Optional[any]) -> bytes:
    input_image = load_image_from_bytes(input_image_bytes)
    if resize:
        input_image = resize_to_max_dim(input_image)
    output_image = remove(input_image, **kwargs)
    return get_image_bytes(output_image)

def resize_to_max_dim(image: Image.Image, max_size=(1000, 1000)) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(max_size)
    return copy

def create_small_thumbnail(image: Image.Image) -> Image.Image:
    return resize_to_max_dim(image, max_size=(200, 200))