from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from io import BytesIO
from src.database.db_operations import DBOperation
from src.models.model_operations import (load_PIL_image_from_bytes,
                                         remove_background,
                                         create_small_thumbnail_base64,
                                         generate_image_hash,
                                         load_model, get_processed_image_tags,
                                         rank_recommended_item_id_by_score)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)
model, processor = load_model()


@app.get("/user/{user_id}/wardrobe")
def get_user_wardrobe(user_id: int) -> list[dict]:
    with DBOperation() as db:
        return [
            {
                "id": item.id,
                "thumbnail": ("" if not item.item.image_thumbnail
                              else item.item.image_thumbnail),
                "description": "" if not item.description else item.description,
                "tags": ([] if not item.item.tags
                         else item.item.tags.split(","))
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
                "tags": ([] if not item.shop_item.item.tags
                         else item.shop_item.item.tags.split(",")),
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
                "tags": ([] if not item.item.tags
                         else item.item.tags.split(",")),
                "price": item.price_desc,
                "link_to_product_page": item.product_url
            } for item in db.get_shop_wardrobe(shop_id)
        ]


@app.get("/shop/{shop_id}/item/{item_id}/image",
         response_class=StreamingResponse)
def get_wishlist_item(shop_id: int, item_id: int) -> StreamingResponse:
    with DBOperation() as db:
        user_wishlist_item = db.get_user_wishlist_item(item_id)
        if user_wishlist_item is None:
            raise HTTPException(status_code=404,
                                detail="Wishlist item not found")
        if user_wishlist_item.shop_item.item.processed_image is None:
            raise HTTPException(status_code=404,
                                detail="Image still processing")
        return StreamingResponse(
            BytesIO(user_wishlist_item.shop_item.item.processed_image),
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


@app.get("/item/{item_id}/image", response_class=StreamingResponse)
def get_item_by_id(item_id) -> StreamingResponse:
    with DBOperation() as db:
        item = db.get_item_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        if item.processed_image is None:
            raise HTTPException(status_code=404,
                                detail="Image still processing")
        return StreamingResponse(
            BytesIO(item.processed_image),
            media_type="image/png"
        )


@app.post("/user/{user_id}/upload")
async def upload_user_item(user_id: int,
                           description: str = Form(None),
                           file: UploadFile = File(...)
):
    image_data = await file.read()
    with DBOperation() as db:
        image_hash = generate_image_hash(image_data)
        existing_item = db.get_item_from_raw_hash(image_hash)
        if existing_item is not None:
            # Item already exists (image may still be processing)
            if (db.get_user_wardrobe_item_by_item_id(user_id, existing_item.id)
                    is not None):
                # Already in user wardrobe, no need to add
                return
            db.add_item_to_user_wardrobe(user_id, existing_item.id, description)
            return
        item_id = db.add_item(image_hash)
        db.add_item_to_user_wardrobe(user_id, item_id, description)
        processed = remove_background(image_data, resize=True)
        processed_pil = load_PIL_image_from_bytes(processed)
        tags = get_processed_image_tags(processed_pil, model, processor)
        thumbnail = create_small_thumbnail_base64(processed_pil)
        db.update_item_details(item_id, processed, thumbnail, tags)


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
def get_wishlist_item_status(shop_id: int, item_id: int) -> dict:
    with DBOperation() as db:
        wishlist_item = db.get_user_wishlist_item(item_id)
        return {
            "exists": wishlist_item is not None,
            "done_processing": (wishlist_item is not None and
                                wishlist_item.shop_item.item.processed_image
                                is not None)
        }


@app.get("/item/{item_id}/status")
def get_item_status(item_id: int) -> dict:
    with DBOperation() as db:
        item = db.get_item_by_id(item_id)
        return {
            "exists": item is not None,
            "done_processing": (item is not None and
                                item.processed_image is not None)
        }


@app.get("/user/{user_id}/{list_name}/item/{item_id}/suggestions")
def get_suggestions_for_item(user_id: int, list_name: str, item_id: int) -> list[dict]:
    with DBOperation() as db:
        if list_name == "wardrobe":
            item = db.get_user_wardrobe_item(user_id, item_id)
        elif list_name == "wishlist":
            item = db.get_user_wishlist_item(item_id)
        else:
            raise HTTPException(status_code=404, detail="List not found")
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        other_items = db.get_all_other_items(item.item)
        other_items_dict = {
            other_item.id: other_item for other_item in other_items
        }

        item_ranking = rank_recommended_item_id_by_score(
            load_PIL_image_from_bytes(item.item.processed_image),
            [(other_item.id,
              load_PIL_image_from_bytes(other_item.processed_image)
              ) for other_item in other_items]
        )
        return [{
            item_id: other_items_dict[item_id].image_thumbnail
        } for item_id in item_ranking[:15]]  # Top 15 only
