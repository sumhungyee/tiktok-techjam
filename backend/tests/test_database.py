import os
# Note: Manually create the "db" folder under the working directory before
# running for first time
os.environ['MINDWAVE_DATABASE_URL'] = 'sqlite:///./db/test.db'


import random
from src.database.db_model import (add_image_processing, get_all_images,
                                           update_image_processed,
                                           get_processed_image_from_raw_hash,
                                           delete_all_images)
from hashlib import sha256


def test_add_image_processing():
    print(add_image_processing(sha256(random.randbytes(32)).hexdigest(),
                               'hat'))
    print(add_image_processing(sha256(random.randbytes(32)).hexdigest(),
                               'glasses'))


def test_get_all_images():
    images = get_all_images()
    for img in images:
        print(img.id, img.image_hash, img.accessory_part, img.processed_blob)


def test_update_image_processed():
    images = get_all_images()
    for img in images:
        update_image_processed(img.id, random.randbytes(32))


def test_get_image_with_hash():
    print(add_image_processing('123456', 'hat'))
    print(add_image_processing('654321', 'glasses'))
    img1 = get_processed_image_from_raw_hash('123456')
    img2 = get_processed_image_from_raw_hash('654321')
    print(img1.id, img1.image_hash, img1.accessory_part, img1.processed_blob)
    print(img2.id, img2.image_hash, img2.accessory_part, img2.processed_blob)
    print(get_processed_image_from_raw_hash('fergrwgw'))
    update_image_processed(99999, b'Non existent image')


if __name__ == '__main__':
    test_add_image_processing()
    test_get_all_images()
    test_update_image_processed()
    test_get_all_images()
    test_get_image_with_hash()
    delete_all_images()
