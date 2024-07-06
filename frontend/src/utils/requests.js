const endpoint_url = 'http://localhost:8000/';

export const getUserWardrobe = async (userId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/wardrobe/`);
}

export const getUserWishlist = async (userId) => {
    return await fetchJsonFromUrl(`${endpoint_url}user/${userId}/wishlist/`);
}

const fetchJsonFromUrl = async (url) => {
    const response = await fetch(url);
    return await response.json();
}
