import base64
from PIL import Image
from typing import Optional
from io import BytesIO
from rembg import remove
import numpy as np
from typing import Iterable
from email.mime.image import MIMEImage
from transformers import CLIPProcessor, CLIPModel

import hashlib


def get_image_bytes(image: Image.Image, resize: bool=False) -> bytes:
    # ImageFile.LOAD_TRUNCATED_IMAGES = True
    if resize:
        image = resize_to_max_dim(image)
    image_byte_array = BytesIO()
    image.save(image_byte_array, format='png')
    return image_byte_array.getvalue()


def load_PIL_image_from_bytes(bytes: bytes, resize: bool=False) -> Image.Image:
    image_byte_array = BytesIO(bytes)
    img = Image.open(image_byte_array)
    if resize:
        return resize_to_max_dim(img)
    return img

def remove_background(input_image_bytes: bytes, resize: bool=False, crop_image: bool = True, **kwargs: Optional[any]) -> bytes:
    input_image = load_PIL_image_from_bytes(input_image_bytes)
    if resize:
        input_image = resize_to_max_dim(input_image)
    output_image = remove(input_image, **kwargs)
    if crop_image:
        output_image = crop_image(output_image)
    return get_image_bytes(output_image)


def resize_to_max_dim(image: Image.Image, max_size=(1000, 1000)) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(max_size)
    return copy


def create_small_thumbnail_base64(image: Image.Image) -> str:
    thumbnail = resize_to_max_dim(image, max_size=(200, 200))
    white_bg = Image.new("RGB", thumbnail.size, (255, 255, 255))
    white_bg.paste(thumbnail.convert("RGB"), (0, 0), thumbnail)
    with BytesIO() as buffer:
        white_bg.save(buffer, format="JPEG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")


def generate_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()


def get_MIME_from_PIL(image: Image.Image) -> MIMEImage:
    with BytesIO() as buffer:
        image.save(buffer, format=image.format)
        byte = buffer.getvalue()
    mime = MIMEImage(byte, _subtype=image.format.lower())
    return mime

def crop_image(image: Image.Image) -> Image.Image:
    copy = image.copy()
    return copy.crop(copy.getbbox())

def get_classes():
   
    return [
    "T-Shirt", "Crop Top", "Jeans", "Sweater", "Jacket",
    "Skirt", "Dress", "Shorts", "Blouse", "Pants",
    "Leggings", "Cardigan", "Hoodie", "Coat", "Tank Top",
    "Suit", "Blazer", "Sweatshirt", "Overalls", "Tracksuit",
    "Scarf", "Hat", "Gloves", "Socks", "Boots",
    "Sneakers", "Sandals", "Heels", "Belt", "Tie",
    "Long Sleeved Shirt", "Vest", "Polo Shirt", "Cargo Pants",
    "Trench Coat", "Bathrobe", "Swimsuit",
    "Capris", "Camisole", "Peacoat", "Poncho", "Anorak",
    "Kimono", "Pajamas", "Gown", "Dungarees"
    ]

   

    # return ["dress", "T-shirt", "shorts", "jeans", "shoes", "skirt", "jacket", "suit", "hat", "glasses"]

def load_model(path : str="patrickjohncyh/fashion-clip") -> tuple[CLIPModel, CLIPProcessor]:
    return CLIPModel.from_pretrained(path), CLIPProcessor.from_pretrained(path)

def classify_processed_image(image: Image.Image, model: CLIPModel, processor: CLIPProcessor) -> str:
    image = image.copy()
    inputs = processor(text=get_classes(),
                   images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image  # this is the image-text similarity score
    probs = logits_per_image.softmax(dim=1) 
    return get_classes()[np.argmax(probs.detach().numpy())]
