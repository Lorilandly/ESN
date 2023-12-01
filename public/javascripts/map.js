var markers = {};

const map = L.map('map').setView([39.8283, -98.5795], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function addMarkersToMap(locations) {
    locations.forEach((loc) => {
        const marker = L.marker([loc.latitude, loc.longitude]).addTo(map);
        marker.bindPopup(`<b>${loc.sender_name}</b><br>${loc.address}, ${loc.city}, ${loc.state}`);

        marker.on('click', function() {
            marker.openPopup();
        });

        markers[loc.id] = marker;
    });
}

$(document).ready(() => {
    $.ajax({
        url: '/locations/all',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            addMarkersToMap(response.locations);
        },
        error: (xhr) => {
            console.error('Error fetching locations:', xhr);
        }
    });
});