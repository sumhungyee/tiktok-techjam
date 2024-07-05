import random
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO
from src.database.db_operations import DBOperation
from src.models.model_operations import (load_PIL_image_from_bytes,
                                         remove_background,
                                         create_small_thumbnail_base64,
                                         generate_image_hash)


app = FastAPI()


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


@app.get("/user/{user_id}/item/{item_id}/status")
def get_user_item_status(user_id: int, item_id: int) -> dict:
    with DBOperation() as db:
        wardrobe_item = db.get_user_wardrobe_item(user_id, item_id)
        return {
            "exists": wardrobe_item is not None,
            "done_processing": (wardrobe_item is not None and
                                wardrobe_item.item.processed_image is not None)
        }


@app.get("/shop/{shop_id}/item/{item_id}/status")
def get_shop_item_status(shop_id: int, item_id: int) -> dict:
    with DBOperation() as db:
        wardrobe_item = db.get_shop_wardrobe_item(shop_id, item_id)
        return {
            "exists": wardrobe_item is not None,
            "done_processing": (wardrobe_item is not None and
                                wardrobe_item.item.processed_image is not None)
        }
