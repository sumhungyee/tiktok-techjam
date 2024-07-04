from src.database.db_base import engine
from sqlalchemy import (Column, Integer, String, BLOB, CHAR, ForeignKey,
                        UniqueConstraint, VARCHAR)
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


class Item(Base):
    __tablename__ = 'items'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_hash = Column(CHAR(64), index=True, nullable=False)
    accessory_part = Column(String, nullable=False)
    processed_image = Column(BLOB, nullable=True)
    image_thumbnail = Column(String, nullable=True)


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)


class UserWardrobe(Base):
    __tablename__ = 'user_wardrobe'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey(User.id), index=True, nullable=False)
    item_id = Column(Integer, ForeignKey(Item.id), nullable=False)
    description = Column(VARCHAR(100), nullable=True)
    tags = Column(VARCHAR(100), nullable=True)
    item = relationship(Item)
    __table_args__ = (UniqueConstraint('user_id', 'item_id',
                                       name='unique_user_item'), )


class Shop(Base):
    __tablename__ = 'shops'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)


class ShopWardrobe(Base):
    __tablename__ = 'shop_wardrobe'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shop_id = Column(Integer, ForeignKey(Shop.id), index=True, nullable=False)
    item_id = Column(Integer, ForeignKey(Item.id), nullable=False)
    description = Column(VARCHAR(100))
    tags = Column(VARCHAR(100), nullable=True)
    price_desc = Column(VARCHAR(200), nullable=False)
    product_url = Column(VARCHAR(200), nullable=False)
    item = relationship(Item)


class UserWishlist(Base):
    __tablename__ = 'user_wishlist'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey(User.id), index=True, nullable=False)
    shop_item_id = Column(Integer, ForeignKey(ShopWardrobe.id), nullable=False)
    shop_item = relationship(ShopWardrobe)
    __table_args__ = (UniqueConstraint('user_id', 'shop_item_id',
                                       name='unique_user_wishlist'), )


Base.metadata.create_all(bind=engine)
