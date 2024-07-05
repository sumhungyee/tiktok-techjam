import os
# Note: Manually create the "db" folder under the working directory before
# running for first time
os.environ['MINDWAVE_DATABASE_URL'] = 'sqlite:///./db/test.db'


import base64
import io
import random
import pytest
from src.database.db_operations import DBOperation
from hashlib import sha256
from io import BytesIO
from PIL import Image
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError


def get_thumbnail_and_sha256(image_data: bytes):
    image = Image.open(io.BytesIO(image_data))
    image.thumbnail((128, 128))
    image = image.convert("RGB")
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str, sha256(image_data).hexdigest()


all_images = []
for i in range(6):
    with open(f'res/sample_images/{i + 1}.png', 'rb') as f:
        img_bytes = f.read()
        all_images.append((img_bytes,) + get_thumbnail_and_sha256(img_bytes))
shop_items = all_images[:3]
user_items = all_images[3:]


@pytest.fixture
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
                                  'top' if random.randint(0, 1) else 'bottom',
                                  thumbnail)
            db.set_item_processed_image(item_id, image)
        # Add some dummy user items
        for image, thumbnail, sha256_hash in user_items:
            item_id = db.add_item(sha256_hash,
                                  'hat' if random.randint(0, 1) else 'glasses',
                                  thumbnail)
            db.set_item_processed_image(item_id, image)
    yield


def test_get_all_items(prefill_db):
    with DBOperation() as db:
        images = db.get_all_items()
    assert len(images) == len(all_images)
    for index, img in enumerate(images):
        assert img.image_hash == all_images[index][2]
        assert img.processed_image == all_images[index][0]
        # Image.open(io.BytesIO(img.processed_image)).show()
        # time.sleep(1)


def test_get_item_with_hash(prefill_db):
    with DBOperation() as db:
        for img in all_images:
            item = db.get_item_from_raw_hash(img[2])
            assert item.image_hash == img[2]
            assert item.processed_image == img[0]


def test_get_non_existent_item_with_hash(prefill_db):
    with DBOperation() as db:
        item = db.get_item_from_raw_hash('fergrwgw')
        assert item is None


def test_set_non_existent_item(prefill_db):
    with DBOperation() as db:
        db.set_item_processed_image(99999, b'Non existent image')


def test_add_item_to_user_wardrobe(prefill_db):
    with DBOperation() as db:
        db.add_item_to_user_wardrobe(1, 4, 'This is a top')
        db.add_item_to_user_wardrobe(1, 5, tags='blue,drip')
        db.add_item_to_user_wardrobe(2, 6)
        wardrobe1 = db.get_user_wardrobe(1)
        wardrobe2 = db.get_user_wardrobe(2)
        assert len(wardrobe1) == 2
        assert len(wardrobe2) == 1
        assert wardrobe1[0].item.image_hash == user_items[0][2]
        assert wardrobe1[0].item.processed_image == user_items[0][0]
        assert wardrobe1[0].description == 'This is a top'
        assert wardrobe1[0].tags is None
        assert wardrobe1[1].item.image_hash == user_items[1][2]
        assert wardrobe1[1].item.processed_image == user_items[1][0]
        assert wardrobe1[1].description is None
        assert wardrobe1[1].tags == 'blue,drip'
        assert wardrobe2[0].item.image_hash == user_items[2][2]
        assert wardrobe2[0].item.processed_image == user_items[2][0]
        assert wardrobe2[0].description is None
        assert wardrobe2[0].tags is None


def test_add_item_to_shop_wardrobe(prefill_db):
    with DBOperation() as db:
        db.add_item_to_shop_wardrobe(1, 1, 'This is a top',
                                     '$20', 'https://shop.com/top',
                                     'red,dri-fit')
        db.add_item_to_shop_wardrobe(1, 2, 'Cool jeans',
                                     'Discount: $25 (original $30!)',
                                     'https://shop.com/jeans')
        db.add_item_to_shop_wardrobe(2, 3, 'Random hat', '$5',
                                     'https://shop.com/hat', 'white')
        wardrobe1 = db.get_shop_wardrobe(1)
        wardrobe2 = db.get_shop_wardrobe(2)
        assert len(wardrobe1) == 2
        assert len(wardrobe2) == 1
        assert wardrobe1[0].item.image_hash == shop_items[0][2]
        assert wardrobe1[0].item.processed_image == shop_items[0][0]
        assert wardrobe1[0].description == 'This is a top'
        assert wardrobe1[0].price_desc == '$20'
        assert wardrobe1[0].product_url == 'https://shop.com/top'
        assert wardrobe1[0].tags == 'red,dri-fit'
        assert wardrobe1[1].item.image_hash == shop_items[1][2]
        assert wardrobe1[1].item.processed_image == shop_items[1][0]
        assert wardrobe1[1].description == 'Cool jeans'
        assert wardrobe1[1].price_desc == 'Discount: $25 (original $30!)'
        assert wardrobe1[1].product_url == 'https://shop.com/jeans'
        assert wardrobe1[1].tags is None
        assert wardrobe2[0].item.image_hash == shop_items[2][2]
        assert wardrobe2[0].item.processed_image == shop_items[2][0]
        assert wardrobe2[0].description == 'Random hat'
        assert wardrobe2[0].price_desc == '$5'
        assert wardrobe2[0].product_url == 'https://shop.com/hat'
        assert wardrobe2[0].tags == 'white'


def test_non_existent_item_to_shop_wardrobe(prefill_db):
    with pytest.raises(IntegrityError):
        with DBOperation() as db:
            db.add_item_to_shop_wardrobe(1, 99999, 'This is a top',
                                         '$20', 'https://shop.com/top',
                                         'red,dri-fit')
            for item in db.get_shop_wardrobe(1):
                print(item.item_id, item.item)


def test_add_item_to_user_wishlist(prefill_db):
    test_add_item_to_shop_wardrobe(None)
    with DBOperation() as db:
        db.add_item_to_user_wishlist(1, 1)
        db.add_item_to_user_wishlist(1, 2)
        db.add_item_to_user_wishlist(2, 3)
        wishlist1 = db.get_user_wishlist(1)
        wishlist2 = db.get_user_wishlist(2)
        assert len(wishlist1) == 2
        assert len(wishlist2) == 1
        assert wishlist1[0].shop_item.item.image_hash == shop_items[0][2]
        assert wishlist1[0].shop_item.item.processed_image == shop_items[0][0]
        assert wishlist1[1].shop_item.item.image_hash == shop_items[1][2]
        assert wishlist1[1].shop_item.item.processed_image == shop_items[1][0]
        assert wishlist2[0].shop_item.item.image_hash == shop_items[2][2]
        assert wishlist2[0].shop_item.item.processed_image == shop_items[2][0]


def test_non_existent_item_to_user_wishlist(prefill_db):
    with pytest.raises(IntegrityError):
        with DBOperation() as db:
            db.add_item_to_user_wishlist(1, 99999)
            for item in db.get_user_wishlist(1):
                print(item.shop_item_id, item.shop_item)
