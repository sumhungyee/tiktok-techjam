from src.database.db_base import SessionMaker
from src.database.db_schema import (Item, UserWardrobe, ShopWardrobe,
                                    UserWishlist, User, Shop)
from typing import Union, List


class DBOperation:
    def __enter__(self):
        self.session = SessionMaker()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.session.close()

    def add_user(self):
        """
        Adds a user to the database
        :return: ID of the user that was added
        """
        new_user = User()
        self.session.add(new_user)
        self.session.commit()
        user_id = new_user.id
        return user_id

    def get_all_users(self):
        users = self.session.query(User).all()
        return users

    def add_shop(self):
        """
        Adds a shop to the database
        :return: ID of the shop that was added
        """
        new_shop = Shop()
        self.session.add(new_shop)
        self.session.commit()
        shop_id = new_shop.id
        return shop_id

    def get_all_shops(self):
        shops = self.session.query(Shop).all()
        return shops

    def add_item(self, image_hash: str):
        """
        Adds the item to the database, while its image submitted for processing
        :param image_hash: hash of the item's raw image
        :return: ID of the item that was added
        """
        new_image = Item(image_hash=image_hash)
        self.session.add(new_image)
        self.session.commit()
        image_id = new_image.id
        return image_id

    def update_item_details(
            self,
            item_id,
            processed_image,
            thumbnail,
            tags: List[str] = None
    ):
        """
        Updates the item with its processed image
        :param item_id: ID of the item that was obtained from
        add_image_processing
        :param processed_image: Processed image binary data, byte-like object
        :param thumbnail: thumbnail of the image, in base64 format
        :param tags: List of tags for the image, can be None
        """
        item = self.session.query(Item).filter(Item.id == item_id).first()
        if item is not None:
            item.processed_image = processed_image
            item.image_thumbnail = thumbnail
            item.tags = ",".join(tags) if tags is not None else ""
        self.session.commit()

    def get_item_from_raw_hash(self, image_hash) -> Union[Item | None]:
        """
        Gets the item with the given hash of the raw image
        :param image_hash: hash of the raw image
        :return: the Item object, or None if not found
        """
        image = self.session.query(Item).filter(
            Item.image_hash == image_hash
        ).first()
        return image

    def get_all_items(self):
        images = self.session.query(Item).all()
        return images

    def delete_all_items(self):
        self.session.query(Item).delete()
        self.session.commit()

    def add_item_to_user_wardrobe(self, user_id: int, item_id: int,
                                  description: str = None):
        """
        Adds an item to the user's wardrobe
        :param user_id: ID of the user
        :param item_id: ID of the item
        :param description: Description of the item (optional)
        """
        new_item = UserWardrobe(user_id=user_id, item_id=item_id,
                                description=description)
        self.session.add(new_item)
        self.session.commit()

    def get_user_wardrobe(self, user_id: int) -> List[UserWardrobe]:
        """
        Get all items in the user's wardrobe
        :param user_id: ID of the user
        :return: List of UserWardrobe objects
        """
        user_wardrobe = self.session.query(UserWardrobe).filter(
            UserWardrobe.user_id == user_id
        ).all()
        return user_wardrobe

    def add_item_to_shop_wardrobe(self, shop_id: int, item_id: int,
                                  description: str, price_desc: str,
                                  product_url: str):
        """
        Adds an item to the shop's wardrobe
        :param shop_id: ID of the shop
        :param item_id: ID of the item
        :param description: Description of the item
        :param price_desc: Price description
        :param product_url: URL of the product
        """
        new_item = ShopWardrobe(shop_id=shop_id, item_id=item_id,
                                description=description, price_desc=price_desc,
                                product_url=product_url)
        self.session.add(new_item)
        self.session.commit()

    def get_shop_wardrobe(self, shop_id: int) -> List[ShopWardrobe]:
        """
        Get all items in the shop's wardrobe
        :param shop_id: ID of the shop
        :return: List of ShopWardrobe objects
        """
        shop_wardrobe = self.session.query(ShopWardrobe).filter(
            ShopWardrobe.shop_id == shop_id
        ).all()
        return shop_wardrobe

    def add_item_to_user_wishlist(self, user_id: int, shop_item_id: int):
        """
        Adds an item to the user's wishlist
        :param user_id: ID of the user
        :param shop_item_id: ID of the item in the shop
        """
        new_item = UserWishlist(user_id=user_id, shop_item_id=shop_item_id)
        self.session.add(new_item)
        self.session.commit()

    def get_user_wishlist(self, user_id: int) -> List[UserWishlist]:
        """
        Get all items in the user's wishlist
        :param user_id: ID of the user
        :return: List of UserWishlist objects
        """
        user_wishlist = self.session.query(UserWishlist).filter(
            UserWishlist.user_id == user_id
        ).all()
        return user_wishlist

    def get_user_wardrobe_item(
            self,
            user_id: int,
            item_id: int
    ) -> Union[UserWardrobe, None]:
        """
        Get the item in the user's wardrobe
        :param user_id: ID of the user
        :param item_id: ID of the item
        :return: UserWardrobe object, or None if not found
        """
        item = self.session.query(UserWardrobe).filter(
            UserWardrobe.user_id == user_id,
            UserWardrobe.id == item_id
        ).first()
        return item

    def get_shop_wardrobe_item(
            self,
            shop_id: int,
            item_id: int
    ) -> Union[ShopWardrobe, None]:
        """
        Get the item in the shop's wardrobe
        :param shop_id: ID of the shop
        :param item_id: ID of the item
        :return: ShopWardrobe object, or None if not found
        """
        item = self.session.query(ShopWardrobe).filter(
            ShopWardrobe.shop_id == shop_id,
            ShopWardrobe.id == item_id
        ).first()
        return item

    def nuke_everything(self, password: str):
        """
        Deletes all the tables in the database

        WARNING: This is a destructive operation - use with caution
        :param password: Password to confirm the operation
        """
        if password != "yesnukemeplease":
            raise ValueError("Invalid password")
        self.session.query(UserWishlist).delete()
        self.session.query(UserWardrobe).delete()
        self.session.query(ShopWardrobe).delete()
        self.session.query(User).delete()
        self.session.query(Shop).delete()
        self.session.query(Item).delete()
        self.session.commit()
