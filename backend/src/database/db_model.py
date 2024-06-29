import os
from sqlalchemy import create_engine, Column, Integer, String, BLOB, CHAR
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = os.getenv('MINDWAVE_DATABASE_URL')
if DATABASE_URL is None:
    raise ValueError('Environment variable MINDWAVE_DATABASE_URL not set')
engine = create_engine(DATABASE_URL, echo=False)
Base = declarative_base()
SessionMaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Image(Base):
    __tablename__ = 'images'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_hash = Column(CHAR(64), index=True, nullable=False)
    accessory_part = Column(String, nullable=False)
    processed_blob = Column(BLOB, nullable=True)


Base.metadata.create_all(bind=engine)


def add_image_processing(image_hash: str, accessory_part: str):
    """
    Adds the image to the database, while it is submitted for processing
    :param image_hash: hash of the raw image
    :param accessory_part: accessory part
    :return: ID of the image that was added
    """
    session = SessionMaker()
    new_image = Image(image_hash=image_hash, accessory_part=accessory_part)
    session.add(new_image)
    session.commit()
    image_id = new_image.id
    session.close()
    return image_id


def update_image_processed(image_id, processed_blob):
    """
    Updates the image with the processed blob
    :param image_id: ID of the image that was obtained with add_image_processing
    :param processed_blob: Processed image binary data
    """
    session = SessionMaker()
    image = session.query(Image).filter(Image.id == image_id).first()
    if image is not None:
        image.processed_blob = processed_blob
    session.commit()
    session.close()


def get_processed_image_from_raw_hash(image_hash) -> Image | None:
    """
    Gets the processed image with the given hash of the raw image
    :param image_hash: hash of the raw image
    :return: the Image object, or None if not found
    """
    session = SessionMaker()
    image = session.query(Image).filter(
        Image.image_hash == image_hash
    ).first()
    session.close()
    return image


def get_all_images():
    session = SessionMaker()
    images = session.query(Image).all()
    session.close()
    return images


def delete_all_images():
    session = SessionMaker()
    session.query(Image).delete()
    session.commit()
    session.close()
