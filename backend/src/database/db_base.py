import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker



DATABASE_URL = os.getenv('MINDWAVE_DATABASE_URL')
if DATABASE_URL is None:
    raise ValueError('Environment variable MINDWAVE_DATABASE_URL not set')

def wait_to_create(retries=3):
    if retries > 0:
        try:
            engine = create_engine(DATABASE_URL, echo=False)
            SessionMaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            return engine, SessionMaker
        except Exception as e:
            time.sleep(2)
            return wait_to_create(retries=retries-1)
    else:
        raise ConnectionError("DB took too long to connect")

engine, SessionMaker = wait_to_create()