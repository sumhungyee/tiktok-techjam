from dotenv import load_dotenv
load_dotenv("prefill.env")


from hashlib import sha256
from io import BytesIO
from PIL import Image
# from sqlalchemy import text
from src.database.db_operations import DBOperation
from src.models.model_operations import create_small_thumbnail_base64


def get_thumbnail_and_sha256(image_data: bytes):
    image = Image.open(BytesIO(image_data))
    thumbnail = create_small_thumbnail_base64(image)
    return thumbnail, sha256(image_data).hexdigest()


image_tags = ['shirt', 'skirt', 'shirt', 'sheath dress', 'idk 1', 'idk 2']
all_images = []
for i in range(6):
    with open(f'res/sample_images/{i + 1}.png', 'rb') as f:
        img_bytes = f.read()
        all_images.append((img_bytes,)
                          + get_thumbnail_and_sha256(img_bytes)
                          + (image_tags[i],))
shop_items = all_images[:3]
user_items = all_images[3:]


def prefill_db():
    with DBOperation() as db:
        # db.session.execute(text('pragma foreign_keys=on'))
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
        for image, thumbnail, sha256_hash, tags in shop_items:
            item_id = db.add_item(sha256_hash)
            db.update_item_details(item_id, image, thumbnail, tags.split(","))
        # Add some dummy user items
        for image, thumbnail, sha256_hash, tags in user_items:
            item_id = db.add_item(sha256_hash)
            db.update_item_details(item_id, image, thumbnail, tags.split(","))

        # Add items to user wardrobe
        db.add_item_to_user_wardrobe(1, 4, 'This is a top')
        db.add_item_to_user_wardrobe(1, 5)
        db.add_item_to_user_wardrobe(2, 6)

        # Add items to shop wardrobe
        db.add_item_to_shop_wardrobe(1, 1, 'This is a top',
                                     '$20', 'https://shop.com/top')
        db.add_item_to_shop_wardrobe(1, 2, 'Cool jeans',
                                     'Discount: $25 (original $30!)',
                                     'https://shop.com/jeans')
        db.add_item_to_shop_wardrobe(2, 3, 'Random hat', '$5',
                                     'https://shop.com/hat')

        # Add items to user wishlist
        db.add_item_to_user_wishlist(1, 1)
        db.add_item_to_user_wishlist(2, 2)
        db.add_item_to_user_wishlist(2, 3)


if __name__ == '__main__':
    prefill_db()
