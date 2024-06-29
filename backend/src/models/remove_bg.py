from rembg import remove
from PIL import Image
from io import BytesIO

def remove_bg_from_image(input_image_bytes: bytes) -> bytes:
    input_image = Image.open(BytesIO(input_image_bytes))
    output_image = remove(input_image)
    output_image_bytes = BytesIO()
    output_image.save(output_image_bytes, format='PNG')
    return output_image_bytes.getvalue()
