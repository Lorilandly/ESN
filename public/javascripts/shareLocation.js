$(document).ready(() => {
    // Handle location form submission
    $('#locationForm').on('submit', function (e) {
        e.preventDefault();
        submitLocationData();
    });

    // Fetch and display all locations on page load
    getAllLocations1();

    // Listen for new location shared
    socket.on('location shared', (newLocation) => {
        addLocationToList(newLocation);
    });
});

function submitLocationData() {
    const address = $('#address').val();
    const city = $('#city').val();
    const state = $('#state').val();

    // Perform validation if necessary
    if (!address || !city || !state) {
        alert('All fields are required.');
        return;
    }

    $.ajax({
        url: '/locations',
        method: 'POST',
        data: {
            address,
            city,
            state,
        },
        dataType: 'json',
        success: () => {
            alert('Current Location submitted successfully.');
            // Clear the form fields
            $('#address').val('');
            $('#city').val('');
            $('#state').val('');
        },
        error: (error) => {
            console.error('Error submitting location data:', error);
            alert('Failed to submit location data.');
        },
    });
}

function getAllLocations1() {
    $.ajax({
        url: '/locations/all',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            response.locations.forEach((location) => {
                console.log('location is ' + location);
                addLocationToList(location);
            });
        },
        error: (error) => {
            console.error('Failed to fetch locations:', error);
        },
    });
}

// function addLocationToList(location) {
//     console.log('street address ' + location.address);
//     const locationDiv = document.createElement('div');
//     locationDiv.className = 'location';
//     locationDiv.innerHTML = `
//         <span>${location.address}, ${location.city}, ${location.state}</span>
//     `;
//     document.getElementById('locationList').appendChild(locationDiv);
// }

function addLocationToList(location) {
    const locationDiv = document.createElement('div');
    locationDiv.className = 'location';

    const addressDiv = document.createElement('div');
    addressDiv.className = 'location-address';
    addressDiv.textContent = location.address;

    const cityDiv = document.createElement('div');
    cityDiv.className = 'location-city';
    cityDiv.textContent = location.city;

    const stateDiv = document.createElement('div');
    stateDiv.className = 'location-state';
    stateDiv.textContent = location.state;

    const senderDiv = document.createElement('div');
    senderDiv.className = 'location-sender';
    senderDiv.textContent = `Shared by: ${location.sender_name}`;

    locationDiv.appendChild(addressDiv);
    locationDiv.appendChild(cityDiv);
    locationDiv.appendChild(stateDiv);
    locationDiv.appendChild(senderDiv);

    document.getElementById('locationList').appendChild(locationDiv);
}
