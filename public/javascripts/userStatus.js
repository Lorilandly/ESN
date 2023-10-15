$(document).ready(() => {
    $('#main-form').submit((event) => {
        event.preventDefault(); // Prevent the default form submission
        // get status
        $.ajax({
            url: '/users/status',
            method: 'POST',
            data: { status: $('#status').find(':selected').val() },
            dataType: 'json',
            success: () => {
                console.log('status update successful');
            },
            error: (err) => {
                console.error('status update somehow error', err);
            },
        });
    });
});
