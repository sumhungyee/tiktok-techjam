const endpoint_url = 'http://121.7.133.17:8000/';

export const getUserWardrobe = async (userId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/wardrobe/`);
}

export const getUserWishlist = async (userId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/wishlist/`);
}

export const getShopWardrobe = async (shopId) => {
    return await fetchJsonFromUrl(`${endpoint_url}shop/${shopId}/wardrobe/`);
}

const getUserItemStatus = async (userId, itemId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/item/${itemId}/status/`);
}

const getShopItemStatus = async (shopId, itemId) => {
    return await fetchJsonFromUrl(`${endpoint_url}shop/${shopId}/item/${itemId}/status/`);
}

export const getUserItemImage = async (userId, itemId, onStillProcessing) => {
    const itemStatus = await getUserItemStatus(userId, itemId);
    if (!itemStatus.done_processing) {
        onStillProcessing();
        return null;
    }
    return await fetchImageFromUrl(`${endpoint_url}user/${userId}/item/${itemId}/image/`);
}

export const getShopItemImage = async (shopId, itemId, onStillProcessing) => {
    const itemStatus = await getShopItemStatus(shopId, itemId);
    if (!itemStatus.done_processing) {
        onStillProcessing();
        return null;
    }
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
