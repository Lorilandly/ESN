$(document).ready(() => {
    $('#status-form').submit((event) => {
        event.preventDefault();
        console.log('status form submitted');
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
