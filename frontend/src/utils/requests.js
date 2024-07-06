const endpoint_url = 'http://localhost:8000/';

export const getUserWardrobe = async (userId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/wardrobe/`);
}

export const getUserWishlist = async (userId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/wishlist/`);
}

export const getShopWardrobe = async (shopId) => {
    return await fetchJsonFromUrl(`${endpoint_url}shop/${shopId}/wardrobe/`);
}

export const getUserItemStatus = async (userId, itemId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/item/${itemId}/status/`);
}

export const getShopItemStatus = async (shopId, itemId) => {
    return await fetchJsonFromUrl(`${endpoint_url}shop/${shopId}/item/${itemId}/status/`);
}

export const getUserItemImage = async (userId, itemId) => {
    return await fetchImageFromUrl(`${endpoint_url}user/${userId}/item/${itemId}/image/`);
}

export const getShopItemImage = async (shopId, itemId) => {
    return await fetchImageFromUrl(`${endpoint_url}shop/${shopId}/item/${itemId}/image/`);
}

const fetchJsonFromUrl = async (url) => {
    const response = await fetch(url);
    return await response.json();
}

const fetchImageFromUrl = async (url) => {
    const response = await fetch(url);
    return await response.blob();
}
