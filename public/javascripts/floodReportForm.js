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
            console.error('API Error:', error);
        },
    });
});
