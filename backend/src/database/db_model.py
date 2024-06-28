from sqlalchemy import create_engine, Column, Integer, String, BLOB, CHAR
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, echo=False)
Base = declarative_base()
SessionMaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Images(Base):
    __tablename__ = 'images'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_hash = Column(CHAR(64), index=True, nullable=False)
    accessory_part = Column(String, nullable=False)
    processed_blob = Column(BLOB, nullable=True)


Base.metadata.create_all(bind=engine)


def add_image_processing(image_hash: str, accessory_part: str):
    """
    Adds the image to the database, while it is submitted for processing
    :param image_hash: SHA256 hash of the image
    :param accessory_part: accessory part
    :return:
    """
    session = SessionMaker()
    new_image = Images(image_hash=image_hash, accessory_part=accessory_part)
    session.add(new_image)
    session.commit()
    session.close()


def update_image_processed(image_id, processed_blob):
    session = SessionMaker()
    image = session.query(Images).filter(Images.id == image_id).first()
    image.processed_blob = processed_blob
    session.commit()
    session.close()


def get_image_with_hash(image_hash):
    session = SessionMaker()
    image = session.query(Images).filter(
        Images.image_hash == image_hash
    ).first()
    session.close()
    return image


def get_all_images():
    session = SessionMaker()
    images = session.query(Images).all()
    session.close()
    return images


def delete_all_images():
    session = SessionMaker()
    session.query(Images).delete()
    session.commit()
    session.close()
