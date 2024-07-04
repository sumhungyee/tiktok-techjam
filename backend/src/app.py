import os 
os.environ['MINDWAVE_DATABASE_URL'] = 'sqlite:///./db/test.db'
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from backend.src.database.db_schema import Item, User, UserWardrobe, UserWishlist, ShopWardrobe
from backend.src.database.db_operations import DBOperation
from backend.src.models.model_operations import (
    get_image_bytes, load_PIL_image_from_bytes, remove_background, resize_to_max_dim,
    create_small_thumbnail, generate_image_hash, get_MIME_from_PIL
    )
from email.mime.image import MIMEImage
import io
from dotenv import load_dotenv

# load_dotenv()
# DATABASE_URL = os.getenv('MINDWAVE_DATABASE_URL')


app = FastAPI()

def initialise_db_w_mock_data() -> None:
    '''initialise database with first user and first shop'''
    with DBOperation() as db:
        db.add_user()
        db.add_shop()

@app.get("/user/{user_id}/wardrobe")
def get_user_wardrobe(user_id: int) -> list[UserWardrobe]:
    with DBOperation() as db:
        return db.get_user_wardrobe()

@app.get("/user/{user_id}/wishlist")
def get_user_wishlist(user_id: int) -> list[UserWishlist]:
    with DBOperation() as db:  
        return db.get_user_wishlist()

@app.get("/shop/{shop_id}/wardrobe")
def get_shop_items(shop_idL: int) -> list[ShopWardrobe]:
    with DBOperation() as db:
        return db.get_shop_wardrobe()
    
@app.get("/shop/{shop_id}/{item_id}/image")
def get_shop_item(shop_id: int, item_id: int) -> ShopWardrobe | None:
    with DBOperation() as db:
        item = db.session.query(ShopWardrobe).filter(ShopWardrobe.shop_id == shop_id)\
            .filter(ShopWardrobe.item_id == item_id).get()
    return item

@app.get("/user/{user_id}/{item_id}/image")
def get_user_item(user_id: int, item_id: int) -> UserWishlist | UserWardrobe | None:
    with DBOperation() as db:
        wishlist = db.session.query(UserWishlist).filter(
            UserWishlist.user_id == user_id).filter(UserWishlist.item_id == item_id
        )
        wardrobe = db.session.query(UserWardrobe).filter(
            UserWardrobe.user_id == user_id).filter(UserWardrobe.item_id == item_id
        )
        result = wishlist.union(wardrobe).get()
        
    return result