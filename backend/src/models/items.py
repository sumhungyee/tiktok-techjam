import json
from abc import ABC
class Item(ABC):
    @abstractmethod
    def as_dict():
        ...

class WardrobeItem(Item):
    def __init__(self, data):
        self.data = data

    def __getitem__(self, key):
        return self.data[key]
    
    def to_json_obj(self):
        return json.loads(str(self.data))