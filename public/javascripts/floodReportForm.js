$('#flood-report-form').submit((event) => {
    event.preventDefault();

    const address = $('#address').val();
    const state = $('#state').val();
    const zipcode = $('#zipcode').val();
    const description = $('#description').val();

    if (address.trim() === '' || state.trim() === '' || zipcode.trim() === '') {
        console.error('Required fields not populated');
        return;
    }

    $.ajax('/floodReports', {
        method: 'POST',
        data: {
            address,
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
