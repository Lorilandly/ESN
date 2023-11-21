$('#flood-report-form').submit((event) => {
    event.preventDefault();

    const floodReportID = $('#flood-report-form').attr('flood-report-id');
    const address = $('#address').val();
    const city = $('#city').val();
    const state = $('#state').val();
    const zipcode = $('#zipcode').val();
    const description = $('#description').val();

    $.ajax('/floodReports/' + floodReportID, {
        method: 'PUT',
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
            console.error('Failed to update flood report:', error);
        },
    });
});
