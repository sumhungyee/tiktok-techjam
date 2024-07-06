import base64
from PIL import Image
from typing import Optional
from io import BytesIO
from rembg import remove
import numpy as np
from typing import Iterable
from email.mime.image import MIMEImage
from colorsys import rgb_to_hsv
from colorthief import ColorThief
from transformers import CLIPProcessor, CLIPModel
from src.database.db_operations import DBOperation
import time
import logging
import hashlib

class PILThiefy(ColorThief):
    def __init__(self, source):
        self.image = source
        # colorthief's constructor cant accept pil images

def timer(function):
    def wrapper(*args, **kwargs):
        start = time.time()
        output = function(*args, **kwargs)
        end = time.time()
        logging.info(f"Function {function.__name__} executed in {end - start} seconds.")
        return output
    return wrapper

@timer
def get_image_bytes(image: Image.Image, resize: bool=False) -> bytes:
    # ImageFile.LOAD_TRUNCATED_IMAGES = True
    if resize:
        image = resize_to_max_dim(image)
    image_byte_array = BytesIO()
    image.save(image_byte_array, format='png')
    return image_byte_array.getvalue()

  
@timer
def load_PIL_image_from_bytes(bytes: bytes, resize: bool=False) -> Image.Image:
    image_byte_array = BytesIO(bytes)
    img = Image.open(image_byte_array)
    if resize:
        return resize_to_max_dim(img)
    return img


@timer
def remove_background(input_image_bytes: bytes, resize: bool=False, crop_image: bool = True, **kwargs: Optional[any]) -> bytes:
    input_image = load_PIL_image_from_bytes(input_image_bytes)
    if resize:
        input_image = resize_to_max_dim(input_image)
    output_image = remove(input_image, **kwargs)
    if crop_image:
        output_image = crop_image(output_image)
    return get_image_bytes(output_image)

@timer
def resize_to_max_dim(image: Image.Image, max_size=(1000, 1000)) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(max_size)
    return copy

@timer
def get_dominant_cols_in_hsv(image: Image.Image, max_size=(10, 10)) -> list[tuple] | np.ndarray:
    pooling = image.copy().resize(max_size, resample=4)
    # colorthief class does not have a constructor that accepts pil image even tho it literally loads it
    # under the hood. bruh
    # did anonymous class that overrides init
    color_thief = type('', (ColorThief,), {
        '__init__': lambda self, source: setattr(self, "image", source)
        })(pooling)
    rgbs = color_thief.get_palette(color_count=3, quality=1)
    return np.apply_along_axis(lambda row: rgb_to_hsv(*row), axis=1, arr=rgbs)

@timer
def match_score(hue: float, saturation: float, value: float, other_hue: float, other_saturation: float, other_value: float):
    assert 0 <= other_hue <= 1
    assert 0 <= hue <= 1
    tup = hue, (hue+1/3)%1, (hue+2/3)%1

    def helper(hue2, hues: Iterable[float]):
        distance = min([min(abs(element - hue2), 1-abs(element - hue2)) for element in hues])
        return max(1/(1 + distance) * (1 - distance*6), 0)
    return helper(other_hue, tup) + 1-abs(saturation - other_saturation) + 1-abs(value - other_value)

@timer
def get_similarity_scores(hsvdomcols1: np.ndarray, hsvdomcols2: np.ndarray, max_score=3) -> float:
    concat = np.concatenate((hsvdomcols1, hsvdomcols2), axis=1)
    return np.sum(
        np.apply_along_axis(lambda row: match_score(*row), axis=1, arr=concat)
    ) / (concat.shape[0] * max_score)

@timer
def get_all_images():
    with DBOperation as db:
        items = db.get_all_items()
        return list(
            map(
                lambda item: load_PIL_image_from_bytes(bytes(item.processed_image)), items
            )
        )

@timer
def rank_recommended_images_by_score(image: Image.Image, others: list[Image.Image]) -> list[Image.Image]:
    mapping = list(
        map(get_dominant_cols_in_hsv, others) # deep copy alr applied
    )
    mapping_self = get_dominant_cols_in_hsv(image)
    mapping_final: list[float] = list(
        map(get_similarity_scores(mapping_self, mapping))
    )
    sorted_ls = sorted(
        list(zip(mapping_final, others)), key=lambda x: x[0], reverse=True
    )
    return zip(*sorted_ls)[1]



@timer
def create_small_thumbnail_base64(image: Image.Image) -> str:
    thumbnail = resize_to_max_dim(image, max_size=(200, 200))
    white_bg = Image.new("RGB", thumbnail.size, (255, 255, 255))
    white_bg.paste(thumbnail.convert("RGB"), (0, 0), thumbnail)
    with BytesIO() as buffer:
        white_bg.save(buffer, format="JPEG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

@timer
def generate_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

@timer
def get_MIME_from_PIL(image: Image.Image) -> MIMEImage:
    with BytesIO() as buffer:
        image.save(buffer, format=image.format)
        byte = buffer.getvalue()
    mime = MIMEImage(byte, _subtype=image.format.lower())
    return mime

@timer
def crop_image(image: Image.Image) -> Image.Image:
    copy = image.copy()
    return copy.crop(copy.getbbox())

@timer
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

@timer
def load_model(path : str="patrickjohncyh/fashion-clip") -> tuple[CLIPModel, CLIPProcessor]:
    return CLIPModel.from_pretrained(path), CLIPProcessor.from_pretrained(path)

@timer
def classify_processed_image(image: Image.Image, model: CLIPModel, processor: CLIPProcessor) -> tuple[str, np.ndarray]:
    image = image.copy()
    inputs = processor(text=get_classes(),
                   images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1) 

    array = probs.detach().numpy()
    return get_classes()[np.argmax(array)], array
