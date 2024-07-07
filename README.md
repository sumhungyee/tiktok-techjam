# tiktok-techjam

## Personal Virtual Dressing Room 
Problem statement: On enhancing tailored discovery on tiktok shop

On the TikTok Shop journey, users often feel overwhelmed by the sheer volume of available options, endlessly scrolling through product pages. MindWave revolutionizes this experience by hyperpersonalizing the search for ideal fashion products.

With MindWave, users can seamlessly add items to their wishlist and later access them in a virtual dressing room. This innovative feature eliminates the need to compare multiple product pages, allowing users to mix and match outfits effortlessly to find their perfect fit.

The virtual dressing room is conveniently accessible via a pop-up button on the 'For You' page when fashion-related ads appear, or from any virtual shop page within TikTok Shop. From the dressing room, users can navigate to their wardrobe page, which consists of two components: clothes they personally own and their wishlist.

By integrating these features, MindWave transforms the TikTok Shop experience, providing a tailored, intuitive, and engaging way to discover their ideal fashion products.

## General Description
> [!NOTE]
> For more details, please refer to our technical documentation under the `docs` folder.

**Technical Stack**

### Frontend

* **JavaScript**: Used for client-side scripting and dynamic behavior
* **React**: Used for building reusable UI components
* **TailwindCSS**: Used for CSS styling and utility-first approach
* **ChakraUI**: Used for UI component library and styling
* **FabricJS**: Used for interactive image rendering and manipulation
* **Vite**: Used for frontend build and development tooling

### Backend

* **FastAPI**: Used for building the RESTful API and handling requests
* **PostgreSQL**: Used as the relational database management system
* **SQLAlchemy**: Used as the ORM (Object-Relational Mapping) tool for interacting with PostgreSQL
* **Rembg**: Used for image background removal
* **Pillow**: Used for image processing and manipulation
* **Transformers**: Used for machine learning tasks such as background removal and image classification

## Datasets and Assets Used
- [Kaggle Fashion Design Dataset](https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset)
- Lucide: Used for icon pack and SVG components

## API Endpoints

### Get User Wardrobe
- **URL**: `/user/{user_id}/wardrobe`
- **Method**: `GET`
- **Parameters**:
  - `user_id` (int): ID of the user
- **Response**: `list[dict]`
- **Description**: Retrieves the wardrobe items of a user.

### Get User Wishlist
- **URL**: `/user/{user_id}/wishlist`
- **Method**: `GET`
- **Parameters**:
  - `user_id` (int): ID of the user
- **Response**: `list[dict]`
- **Description**: Retrieves the wishlist items of a user.

### Get Shop Wardrobe
- **URL**: `/shop/{shop_id}/wardrobe`
- **Method**: `GET`
- **Parameters**:
  - `shop_id` (int): ID of the shop
- **Response**: `list[dict]`
- **Description**: Retrieves the wardrobe items available in a shop.

### Get Wishlist Item Image
- **URL**: `/shop/{shop_id}/item/{item_id}/image`
- **Method**: `GET`
- **Parameters**:
  - `shop_id` (int): ID of the shop
  - `item_id` (int): ID of the item
- **Response**: `StreamingResponse`
- **Description**: Retrieves the image of a wishlist item.

### Get User Item Image
- **URL**: `/user/{user_id}/item/{item_id}/image`
- **Method**: `GET`
- **Parameters**:
  - `user_id` (int): ID of the user
  - `item_id` (int): ID of the item
- **Response**: `StreamingResponse`
- **Description**: Retrieves the image of a user's wardrobe item.

### Get Item Image by ID
- **URL**: `/item/{item_id}/image`
- **Method**: `GET`
- **Parameters**:
  - `item_id` (int): ID of the item
- **Response**: `StreamingResponse`
- **Description**: Retrieves the image of an item by its ID.

### Upload User Item
- **URL**: `/user/{user_id}/upload`
- **Method**: `POST`
- **Parameters**:
  - `user_id` (int): ID of the user
  - `description` (str, optional): Description of the item
  - `file` (UploadFile): Image file to upload
- **Response**: `None`
- **Description**: Uploads a new item to the user's wardrobe.

### Get User Item Status
- **URL**: `/user/{user_id}/item/{item_id}/status`
- **Method**: `GET`
- **Parameters**:
  - `user_id` (int): ID of the user
  - `item_id` (int): ID of the item
- **Response**: `dict`
- **Description**: Retrieves the processing status of a user's wardrobe item.

### Get Wishlist Item Status
- **URL**: `/shop/{shop_id}/item/{item_id}/status`
- **Method**: `GET`
- **Parameters**:
  - `shop_id` (int): ID of the shop
  - `item_id` (int): ID of the item
- **Response**: `dict`
- **Description**: Retrieves the processing status of a wishlist item.

### Get Item Status by ID
- **URL**: `/item/{item_id}/status`
- **Method**: `GET`
- **Parameters**:
  - `item_id` (int): ID of the item
- **Response**: `dict`
- **Description**: Retrieves the processing status of an item by its ID.

### Get Suggestions for Item
- **URL**: `/user/{user_id}/{list_name}/item/{item_id}/suggestions`
- **Method**: `GET`
- **Parameters**:
  - `user_id` (int): ID of the user
  - `list_name` (str): Name of the list (wardrobe or wishlist)
  - `item_id` (int): ID of the item
- **Response**: `list[dict]`
- **Description**: Retrieves suggestions for an item in the user's wardrobe or wishlist.
