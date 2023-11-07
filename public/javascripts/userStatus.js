$(document).ready(() => {
    $('#status-form').submit((event) => {
        event.preventDefault();
        $.ajax({
            url: '/users/status',
            method: 'POST',
            data: { status: $('#status').find(':selected').val() },
            dataType: 'json',
            success: () => {
                location.reload();
            },
            error: (err) => {
                console.error('status update somehow error', err);
            },
        });
    });
});
