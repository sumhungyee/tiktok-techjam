import os
os.environ['MINDWAVE_DATABASE_URL'] = 'sqlite:///./db/test.db'


import random
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from hashlib import sha256
from io import BytesIO
from PIL import Image
from sqlalchemy import text
from src.database.db_operations import DBOperation
from src.models.model_operations import (load_PIL_image_from_bytes,
                                         remove_background,
                                         create_small_thumbnail_base64,
                                         generate_image_hash)

# from dotenv import load_dotenv
# load_dotenv()
# DATABASE_URL = os.getenv('MINDWAVE_DATABASE_URL')


def get_thumbnail_and_sha256(image_data: bytes):
    image = Image.open(BytesIO(image_data))
    thumbnail = create_small_thumbnail_base64(image)
    return thumbnail, sha256(image_data).hexdigest()


all_images = []
for i in range(6):
    with open(f'res/sample_images/{i + 1}.png', 'rb') as f:
        img_bytes = f.read()
        all_images.append((img_bytes,) + get_thumbnail_and_sha256(img_bytes))
shop_items = all_images[:3]
user_items = all_images[3:]


def prefill_db():
    with DBOperation() as db:
        db.session.execute(text('pragma foreign_keys=on'))
        db.nuke_everything(password="yesnukemeplease")
        assert len(db.get_all_items()) == 0
        db.add_user()
        db.add_user()
        all_users = db.get_all_users()
        assert set([user.id for user in all_users]) == {1, 2}
        db.add_shop()
        db.add_shop()
        all_shops = db.get_all_shops()
        assert set([shop.id for shop in all_shops]) == {1, 2}
        # Add some dummy shop items
        for image, thumbnail, sha256_hash in shop_items:
            item_id = db.add_item(sha256_hash,
                                  'top' if random.randint(0, 1) else 'bottom')
            db.set_item_processed_image(item_id, image, thumbnail)
        # Add some dummy user items
        for image, thumbnail, sha256_hash in user_items:
            item_id = db.add_item(sha256_hash,
                                  'hat' if random.randint(0, 1) else 'glasses')
            db.set_item_processed_image(item_id, image, thumbnail)

        # Add items to user wardrobe
        db.add_item_to_user_wardrobe(1, 4, 'This is a top')
        db.add_item_to_user_wardrobe(1, 5, tags='blue,drip')
        db.add_item_to_user_wardrobe(2, 6)

        # Add items to shop wardrobe
        db.add_item_to_shop_wardrobe(1, 1, 'This is a top',
                                     '$20', 'https://shop.com/top',
                                     'red,dri-fit')
        db.add_item_to_shop_wardrobe(1, 2, 'Cool jeans',
                                     'Discount: $25 (original $30!)',
                                     'https://shop.com/jeans')
        db.add_item_to_shop_wardrobe(2, 3, 'Random hat', '$5',
                                     'https://shop.com/hat', 'white')

        # Add items to user wishlist
        db.add_item_to_user_wishlist(1, 1)
        db.add_item_to_user_wishlist(2, 2)
        db.add_item_to_user_wishlist(2, 3)


prefill_db()
app = FastAPI()


def initialise_db_w_mock_data() -> None:
    '''initialise database with first user and first shop'''
    with DBOperation() as db:
        db.add_user()
        db.add_shop()


@app.get("/user/{user_id}/wardrobe")
def get_user_wardrobe(user_id: int) -> list[dict]:
    with DBOperation() as db:
        return [
            {
                "id": item.id,
                "thumbnail": ("" if not item.item.image_thumbnail
                              else item.item.image_thumbnail),
                "description": "" if not item.description else item.description,
                "tags": ([] if not item.tags
                         else item.tags.split(","))
            } for item in db.get_user_wardrobe(user_id)
        ]


@app.get("/user/{user_id}/wishlist")
def get_user_wishlist(user_id: int) -> list[dict]:
    with DBOperation() as db:
        return [
            {
                "id": item.id,
                "thumbnail": ("" if not item.shop_item.item.image_thumbnail
                              else item.shop_item.item.image_thumbnail),
                "description": item.shop_item.description,
                "tags": ([] if not item.shop_item.tags
                         else item.shop_item.tags.split(",")),
                "price": item.shop_item.price_desc,
                "shop_id": item.shop_item.shop_id
            } for item in db.get_user_wishlist(user_id)]


@app.get("/shop/{shop_id}/wardrobe")
def get_shop_items(shop_id: int) -> list[dict]:
    with DBOperation() as db:
        return [
            {
                "id": item.id,
                "thumbnail": ("" if not item.item.image_thumbnail
                              else item.item.image_thumbnail),
                "description": item.description,
                "tags": ([] if not item.tags
                         else item.tags.split(",")),
                "price": item.price_desc,
                "link_to_product_page": item.product_url
            } for item in db.get_shop_wardrobe(shop_id)
        ]


@app.get("/shop/{shop_id}/item/{item_id}/image",
         response_class=StreamingResponse)
def get_shop_item(shop_id: int, item_id: int) -> StreamingResponse:
    with DBOperation() as db:
        shop_wardrobe_item = db.get_shop_wardrobe_item(shop_id, item_id)
        if shop_wardrobe_item is None:
            raise HTTPException(status_code=404, detail="Shop item not found")
        if shop_wardrobe_item.item.processed_image is None:
            raise HTTPException(status_code=404,
                                detail="Image still processing")
        return StreamingResponse(
            BytesIO(shop_wardrobe_item.item.processed_image),
            media_type="image/png"
        )


@app.get("/user/{user_id}/item/{item_id}/image",
         response_class=StreamingResponse)
def get_user_item(user_id: int, item_id: int) -> StreamingResponse:
    with DBOperation() as db:
        wardrobe_item = db.get_user_wardrobe_item(user_id, item_id)
        if wardrobe_item is None:
            raise HTTPException(status_code=404, detail="User item not found")
        if wardrobe_item.item.processed_image is None:
            raise HTTPException(status_code=404,
                                detail="Image still processing")
        return StreamingResponse(
            BytesIO(wardrobe_item.item.processed_image),
            media_type="image/png"
        )


@app.post("/user/{user_id}/upload")
async def upload_user_item(user_id: int, file: UploadFile = File(...)):
    image_data = await file.read()
    with DBOperation() as db:
        image_hash = generate_image_hash(image_data)
        existing_item = db.get_item_from_raw_hash(image_hash)
        if existing_item is not None:
            if db.get_user_wardrobe_item(user_id, existing_item.id) is not None:
                # Already in user wardrobe, no need to add
                return
            db.add_item_to_user_wardrobe(user_id, existing_item.id)
            return
        item_id = db.add_item(image_hash,'hat')
        db.add_item_to_user_wardrobe(user_id, item_id)
        processed = remove_background(image_data)
        thumbnail = create_small_thumbnail_base64(
            load_PIL_image_from_bytes(processed)
        )
        db.set_item_processed_image(item_id, processed, thumbnail)
