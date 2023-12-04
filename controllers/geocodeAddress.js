import fetch from 'node-fetch';

async function geocodeAddress(street, city, state) {
    const address = `${street}, ${city}, ${state}`;
    const baseUrl = 'https://nominatim.openstreetmap.org/search';
    const queryParams = new URLSearchParams({
        q: address,
        format: 'json',
        addressdetails: 1,
    });

    const response = await fetch(`${baseUrl}?${queryParams}`);
    const data = await response.json();

    if (data.length === 0) {
        throw new Error('Address not found');
    }

    return {
        latitude: data[0].lat,
        longitude: data[0].lon,
    };
}

export { geocodeAddress };
