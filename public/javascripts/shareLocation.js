/* global socket modifyHeader */

$(document).ready(() => {
    modifyHeader(false, 'View Locations');
    document.getElementById('share-location').classList.add('text-primary');

    $('#locationForm').on('submit', function (e) {
        e.preventDefault();
        submitLocationData();
    });

    $('#respondForm').submit(function (e) {
        e.preventDefault();
        submitResponseData();
    });

    // Fetch and display all locations
    getAllLocations();

    // Listen for new location shared
    socket.on('location shared', (newLocation) => {
        addLocationToList(newLocation);
    });

    // Listen for new responses
    socket.on('response shared', (response) => {
        displayResponse(response.location_id, response);
    });
});

function submitLocationData() {
    const address = $('#address').val();
    const city = $('#city').val();
    const state = $('#state').val();

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
            // clear inputs
            $('#address').val('');
            $('#city').val('');
            $('#state').val('');
        },
        error: (xhr, status, error) => {
            if (xhr.status === 409) {
                alert(xhr.responseJSON.message);
                window.location.href = '/location-settings';
            } else if (xhr.status === 400) {
                alert(xhr.responseJSON.message);
            } else {
                console.error('Error submitting location data:', error);
                alert('Failed to submit location data.');
            }
        },
    });
}

function submitResponseData() {
    const locationId = $('#respondLocationId').val();
    const responseMessage = $('#responseMessage').val();

    $.ajax({
        url: `/locations/${locationId}/respond`,
        method: 'POST',
        data: {
            message: responseMessage,
            location_id: locationId,
        },
        success: () => {
            $('#respondModal').modal('hide');
            $('#responseMessage').val('');
        },
        error: (error) => {
            console.error('Error submitting response:', error);
            alert('Failed to submit response.');
        },
    });
}

function displayResponse(locationId, response) {
    const responsesContainer = $(`#responsesForLocation${locationId}`);
    const newResponseDiv = $('<div class="response"></div>');

    newResponseDiv.append(`
        <p>
            <strong>${response.sender_name}</strong>: 
            ${response.message} 
            <span class="timestamp">${response.time}</span>
        </p>
    `);

    responsesContainer.append(newResponseDiv);
}

function getAllLocations() {
    $.ajax({
        url: '/locations/all',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            response.locations.forEach((location) => {
                addLocationToList(location);
                fetchResponsesForLocation(location.id);
            });
        },
        error: (error) => {
            console.error('Failed to fetch locations:', error);
        },
    });
}

function addLocationToList(location) {
    const locationDiv = document.createElement('div');
    locationDiv.className = 'location';
    locationDiv.id = 'location-' + location.id;

    locationDiv.innerHTML = `
        <div class="location-sender"><strong>${location.sender_name}</strong></div>
        <div class="location-address"><strong>Street Address:</strong> ${location.address}</div>
        <div class="location-city"><strong>City:</strong> ${location.city}</div>
        <div class="location-state"><strong>State:</strong> ${location.state}</div>
        <div class="location-time"><strong>Help needed since:</strong> ${location.time}</div>
    `;

    const respondBtn = document.createElement('button');
    respondBtn.className = 'btn btn-secondary respondBtn';
    respondBtn.textContent = 'Respond';
    respondBtn.setAttribute('data-id', location.id);
    respondBtn.addEventListener('click', function () {
        openRespondModal(location.id);
    });
    locationDiv.appendChild(respondBtn);

    const responsesContainer = document.createElement('div');
    responsesContainer.id = `responsesForLocation${location.id}`;
    responsesContainer.className = 'responses-container';
    locationDiv.appendChild(responsesContainer);

    document.getElementById('locationList').appendChild(locationDiv);
}

function openRespondModal(locationId) {
    $('#respondLocationId').val(locationId);
    $('#respondModal').modal('show');
}

function fetchResponsesForLocation(locationId) {
    $.ajax({
        url: `/locations/${locationId}/responses`,
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            $(`#responsesForLocation${locationId}`).empty();

            response.responses.forEach((reply) => {
                displayResponse(locationId, reply);
            });
        },
        error: (error) => {
<<<<<<< HEAD
            console.error(
                `Failed to fetch responses for location ${locationId}:`,
                error,
            );
=======
            console.error(`Failed to fetch responses for location ${locationId}:`, error);
>>>>>>> main
        },
    });
}
