import os
# Note: Manually create the "db" folder under the working directory before
# running for first time
os.environ['MINDWAVE_DATABASE_URL'] = 'sqlite:///./db/test.db'


import base64
import io
import random
import time
from backend.src.database.db_operations import DBOperation
from hashlib import sha256
from io import BytesIO
from PIL import Image


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
    with open(f'backend/res/sample_images/{i + 1}.png', 'rb') as f:
        img_bytes = f.read()
        all_images.append((img_bytes,) + get_thumbnail_and_sha256(img_bytes))


def prefill_db():
    with DBOperation() as db:
        db.nuke_everything(password="yesnukemeplease")
        db.add_user()
        db.add_user()
        db.add_shop()
        db.add_shop()
        # Add some dummy shop items
        for image, thumbnail, sha256_hash in all_images[:3]:
            item_id = db.add_item(sha256_hash,
                                  'top' if random.randint(0, 1) else 'bottom',
                                  thumbnail)
            db.set_item_processed_image(item_id, image)


def test_add_item():
    with DBOperation() as db:
        for image, thumbnail, sha256_hash in all_images[3:]:
            item_id = db.add_item(sha256_hash,
                                  'hat' if random.randint(0, 1) else 'glasses',
                                  thumbnail)
            db.set_item_processed_image(item_id, image)


def test_get_all_items():
    with DBOperation() as db:
        images = db.get_all_items()
    for index, img in enumerate(images):
        print(img.id, img.image_hash, img.accessory_part)
        assert img.image_hash == all_images[index][2]
        assert img.processed_image == all_images[index][0]
        Image.open(io.BytesIO(img.processed_image)).show()
        time.sleep(1)


def test_get_image_with_hash():
    with DBOperation() as db:
        for img in all_images:
            item = db.get_item_from_raw_hash(img[2])
            print(item.id, item.image_hash, item.accessory_part)
            assert item.image_hash == img[2]
            assert item.processed_image == img[0]
        non_existent_item = db.get_item_from_raw_hash('fergrwgw')
        assert non_existent_item is None


def test_set_non_existent_item():
    with DBOperation() as db:
        db.set_item_processed_image(99999, b'Non existent image')


if __name__ == '__main__':
    prefill_db()
    test_add_item()
    test_get_all_items()
    test_get_image_with_hash()
    test_set_non_existent_item()
