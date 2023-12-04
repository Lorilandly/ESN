/* global socket getCurrentUser modifyHeader */

$(document).ready(() => {
    modifyHeader(false, 'Location Setting');
    document.getElementById('share-location').classList.add('text-primary');
    fetchUserLocation();

    $('#editLocationBtn').click(() => {
        $('#editLocationModal').modal('show');
    });

    $('#editLocationForm').submit(function (e) {
        e.preventDefault();
        updateLocation();
    });

    $('#deleteLocationBtn').click(() => {
        if (confirm('Would you like to stop sharing your current location?')) {
            deleteLocation();
        }
    });

    // Listen for location share stopped
    socket.on('location sharing stopped', () => {
        const locationElement = document.getElementById(
            'location-' + data.userId,
        );
        if (locationElement) {
            locationElement.parentNode.removeChild(locationElement);
        } else {
            console.error(
                'Could not find the location element for user:',
                data.userId,
            );
        }
    });
});

async function fetchUserLocation() {
    const user = await getCurrentUser();
    const currentId = user.id;

    $.ajax({
        url: `/locations/${currentId}`,
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            if (response.curLocation && response.curLocation.length > 0) {
                const locationData = response.curLocation[0];
                $('#locationAddress').text(locationData.address);
                $('#locationCity').text(locationData.city);
                $('#locationState').text(locationData.state);
            } else {
                $('#currentLocation').html('<p>Location not set.</p>');
            }
        },
        error: (error) => {
            console.error('Error fetching location:', error);
            $('#currentLocation').html('<p>Error fetching location.</p>');
        },
    });
}

async function updateLocation() {
    const user = await getCurrentUser();
    const currentId = user.id;
    const address = $('#editAddress').val();
    const city = $('#editCity').val();
    const state = $('#editState').val();

    $.ajax({
        url: `/locations/${currentId}`,
        method: 'PUT',
        data: {
            address,
            city,
            state,
        },
        success: () => {
            $('#editLocationModal').modal('hide');
            fetchUserLocation();
        },
        error: (xhr, status, error) => {
            if (xhr.status === 400) {
                alert(xhr.responseJSON.message);
            } else {
                console.error('Error updating location:', error);
                alert('Failed to update location.');
            }
        },
    });
}

function deleteLocation() {
    $.ajax({
        url: '/locations',
        method: 'DELETE',
        success: () => {
            $('#locationAddress').text('');
            $('#locationCity').text('');
            $('#locationState').text('');
        },
        error: (error) => {
            console.error('Error deleting location:', error);
            alert('Failed to delete location.');
        },
    });
}
