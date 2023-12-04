/* global modifyHeader */

$('#flood-report-form').submit((event) => {
    event.preventDefault();

    const address = $('#address').val();
    const city = $('#city').val();
    const state = $('#state').val();
    const zipcode = $('#zipcode').val();
    const description = $('#description').val();

    $.ajax('/floodReports', {
        method: 'POST',
        data: {
            address,
            city,
            state,
            zipcode,
            description,
        },
        dataType: 'json',
        success: (_) => {
            window.location.replace('/floodNotices');
        },
        error: (error) => {
            console.error('Failed to create flood report:', error);
        },
    });
});

$(document).ready(() => {
    modifyHeader(false, 'Create Flood Report');
    document.getElementById('flood-reports-button').classList.add('text-primary');
});
