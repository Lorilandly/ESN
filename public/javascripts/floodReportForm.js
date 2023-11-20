$('#flood-report-form').submit((event) => {
    event.preventDefault();

    const address = $('#address').val();
    const city = $('#city').val();
    const state = $('#state').val();
    const zipcode = $('#zipcode').val();
    const description = $('#description').val();

    if (
        address.trim() === '' ||
        city.trim() === '' ||
        state.trim() === '' ||
        zipcode.trim() === ''
    ) {
        // TODO: inform user
        console.error('Required fields not populated');
        return;
    }

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
        success: (resp) => {
            window.location.replace('/floodNotices');
        },
        error: (error) => {
            console.error('API Error:', error);
        },
    });
});
