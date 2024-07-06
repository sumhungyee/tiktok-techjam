import base64
from PIL import Image
from typing import Optional
from io import BytesIO
from rembg import remove
import numpy as np
from email.mime.image import MIMEImage
from transformers import CLIPProcessor, CLIPModel
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
        path: str = "patrickjohncyh/fashion-clip"
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
