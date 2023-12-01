$('#flood-report-form').submit((event) => {
    event.preventDefault();

    const floodReportID = $('#flood-report-form').attr('flood-report-id');

    $.ajax('/floodReports/' + floodReportID, {
        method: 'PUT',
        data: {
            address: $('#address').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            zipcode: $('#zipcode').val(),
            description: $('#description').val(),
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
