import random
from database.db_model import (add_image_processing, get_all_images,
                               update_image_processed, get_image_with_hash,
                               delete_all_images)
from hashlib import sha256


def test_add_image_processing():
    add_image_processing(sha256(random.randbytes(32)).hexdigest(),
                         'hat')
    add_image_processing(sha256(random.randbytes(32)).hexdigest(),
                         'glasses')


def test_get_all_images():
    images = get_all_images()
    for img in images:
        print(img.id, img.image_hash, img.accessory_part, img.processed_blob)


def test_update_image_processed():
    images = get_all_images()
    for img in images:
        update_image_processed(img.id, random.randbytes(32))


def test_get_image_with_hash():
    add_image_processing('123456', 'hat')
    add_image_processing('654321', 'glasses')
    img1 = get_image_with_hash('123456')
    img2 = get_image_with_hash('654321')
    print(img1.id, img1.image_hash, img1.accessory_part, img1.processed_blob)
    print(img2.id, img2.image_hash, img2.accessory_part, img2.processed_blob)


if __name__ == '__main__':
    test_add_image_processing()
    test_get_all_images()
    test_update_image_processed()
    test_get_all_images()
    test_get_image_with_hash()
    delete_all_images()
