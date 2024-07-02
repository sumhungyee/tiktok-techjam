import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


DATABASE_URL = os.getenv('MINDWAVE_DATABASE_URL')
if DATABASE_URL is None:
    raise ValueError('Environment variable MINDWAVE_DATABASE_URL not set')
engine = create_engine(DATABASE_URL, echo=False)
SessionMaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
