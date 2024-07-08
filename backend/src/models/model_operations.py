import base64
from PIL import Image
from typing import Optional
from io import BytesIO
from rembg import remove
import numpy as np
from email.mime.image import MIMEImage
from colorsys import rgb_to_hsv
from colorthief import ColorThief
from transformers import CLIPProcessor, CLIPModel
from typing import Iterable
import time
import logging
import hashlib


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
def remove_background(
        input_image_bytes: bytes,
        resize: bool = False,
        crop_image: bool = True,
        **kwargs: Optional[any]
) -> bytes:
    input_image = load_PIL_image_from_bytes(input_image_bytes)
    if resize:
        input_image = resize_to_max_dim(input_image)
    output_image = remove(input_image, **kwargs)
    if crop_image:
        output_image = crop(output_image)
    return get_image_bytes(output_image)


@timer
def resize_to_max_dim(image: Image.Image, max_size=(1000, 1000)) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(max_size)
    return copy


@timer
def get_dominant_cols_in_hsv(image: Image.Image, max_size=(10, 10)) -> np.ndarray:
    pooling = image.copy().resize(max_size, resample=4)
    # colorthief class does not have a constructor that accepts pil image even tho it literally loads it
    # under the hood. bruh
    # did anonymous class that overrides init
    color_thief = type('', (ColorThief,), {
        '__init__': lambda self, source: setattr(self, "image", source)
        })(pooling)
    rgbs = color_thief.get_palette(color_count=3, quality=1)
    return np.apply_along_axis(lambda row: rgb_to_hsv(*row), axis=1, arr=rgbs)


# @timer
# def match_score(hue: float, saturation: float, value: float, other_hue: float, other_saturation: float, other_value: float):
#     assert 0 <= other_hue <= 1
#     assert 0 <= hue <= 1
#     tup = hue, (hue+1/3)%1, (hue+2/3)%1

#     def helper(hue2, hues: Iterable[float], pow: int = 4):
#         mult = len(hues) * 2
#         distance = min([min(abs(element - hue2), 1-abs(element - hue2)) for element in hues])
#         return max(1/(1 + distance) * (1 - (distance*mult)**pow), 0)
#     return helper(other_hue, tup) + 1-abs(saturation - other_saturation) + 1-abs(value - other_value)

@timer
def match_score(hue: float, saturation: float, value: float, other_hue: float, other_saturation: float, other_value: float):
    assert 0 <= other_hue <= 1
    assert 0 <= hue <= 1
    tup = hue, (hue+1/2)%1

    def helper(hue2, hues: tuple[float], pow: int = 4):
        mult = len(hues) * 2
        distance, distance_opp = min(abs(hues[0] - hue2), 1-abs(hues[0] - hue2)), min(abs(hues[1] - hue2), 1-abs(hues[1] - hue2))
        return max(1/(1 + distance) * (1 - (distance*mult)**pow),  1/(1 + distance) * (1 - distance_opp*mult),  0)
    return helper(other_hue, tup) + 1-abs(saturation - other_saturation) + 1-abs(value - other_value)


@timer
def get_similarity_scores(hsvdomcols1: np.ndarray, hsvdomcols2: np.ndarray, max_score=3) -> float:
    concat = np.concatenate((hsvdomcols1, hsvdomcols2), axis=1)
    return np.sum(
        np.apply_along_axis(lambda row: match_score(*row), axis=1, arr=concat)
    ) / (concat.shape[0] * max_score)


@timer
def rank_recommended_item_id_by_score(
        image: Image.Image,
        others: list[tuple[int, Image.Image]]
) -> list[int]:
    item_id_list = list(map(lambda x: x[0], others))
    image_list = list(map(lambda x: x[1], others))
    mapping_others = list(
        map(get_dominant_cols_in_hsv, image_list)  # deep copy alr applied
    )
    mapping_self = get_dominant_cols_in_hsv(image)
    mapping_final: list[float] = list(
        map(lambda x: get_similarity_scores(mapping_self, x), mapping_others)
    )
    sorted_ls = sorted(
        list(zip(mapping_final, item_id_list)), key=lambda x: x[0], reverse=True
    )
    return list(map(lambda x: x[1], sorted_ls))


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
def crop(image: Image.Image) -> Image.Image:
    copy = image.copy()
    return copy.crop(copy.getbbox())


@timer
def get_classes() -> list[str]:
    return [
        "T-Shirt", "Crop Top", "Jeans", "Sweater", "Jacket",
        "Skirt", "Dress", "Shorts", "Blouse", "Pants",
        "Leggings", "Cardigan", "Hoodie", "Coat", "Tank Top",
        "Suit", "Blazer", "Sweatshirt", "Overalls", "Tracksuit",
        "Scarf", "Hat", "Gloves", "Boots", "Slippers", "Crocs",
        "Sneakers", "Sandals", "Heels", "Belt", "Tie",
        "Long Sleeved Shirt", "Vest", "Polo Shirt", "Cargo Pants",
        "Trench Coat", "Swimsuit",
        "Capris", "Camisole", "Peacoat", "Poncho", "Anorak",
        "Kimono", "Pajamas", "Gown"
    ]


def get_broad() -> dict[str, str]:
    # CLIP model requires more clarity than human tags.
    # Solution is to create a map
    for_user = [
        "Tops", "Bottoms", "Dresses", "Outerwear", "Sleepwear", "Footwear",
        "Headwear", "Accessories", "Swimwear"
    ]
    for_clip = for_user.copy()
    for i in range(2):
        for_clip[i] = "Clothing " + for_clip[i]
    return dict(zip(for_clip, for_user))


def get_material() -> dict[str, str]:
    for_user = [ # metal is for sunglasses or whatever crazy accessory they have
        "Denim", "Fabric", "Leather", "Furs", "Velvet"
    ]
    for_clip = list(map(lambda x: f"Clothing made from {x.lower()}", for_user.copy()))
    return dict(zip(for_clip, for_user))


@timer
def load_model(
        path: str = "./src/models/fashion-clip"
) -> tuple[CLIPModel, CLIPProcessor]:
    return CLIPModel.from_pretrained(path), CLIPProcessor.from_pretrained(path)


@timer
def classify_processed_image(
        image: Image.Image,
        model: CLIPModel,
        processor: CLIPProcessor,
        classes: list[str]
) -> tuple[str, np.ndarray]:
    image = image.copy()
    inputs = processor(text=classes, images=image, return_tensors="pt",
                       padding=True)
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)

    array = probs.detach().numpy()
    return classes[np.argmax(array)], array


@timer
def get_processed_image_tags(
        processed_image: Image,
        model: CLIPModel,
        processor: CLIPProcessor
) -> list[str]:
    # for clarity: model understands "Clothing tops" more than "tops"
    tags: list[str] = []  # user side
    broad_class_dict = get_broad()
    broad_class_for_clip = list(broad_class_dict.keys())
    tags.append(
        broad_class_dict[
            classify_processed_image(processed_image, model, processor,
                                     broad_class_for_clip)[0]
        ]
    )

    if tags[0] not in ["Accessories", "Swimwear"]:
        tags.append(
            classify_processed_image(processed_image, model, processor,
                                     get_classes())[0]
        )

        #### UNSURE ABOUT THIS, CAN DELETE
        # materials_dict = get_material()
        # materials_for_clip = list(materials_dict.keys())
        # tags.append(
        #     materials_dict[
        #         classify_processed_image(load_PIL_image_from_bytes(processed), model, processor, materials_for_clip)[0]
        #     ]
        # )
        ####

    return tags
