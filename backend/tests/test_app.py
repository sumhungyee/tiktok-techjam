from src.app import get_shop_item, get_user_item
from src.database.db_operations import DBOperation

def test_get_user_item():
    with DBOperation() as db:
        db.add_item_to_user_wishlist(1, 1)
        db.add_item_to_user_wishlist(1, 2)
        db.add_item_to_user_wishlist(1, 3)
    assert get_user_item(1, 2).id == 2