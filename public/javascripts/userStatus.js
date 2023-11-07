$(document).ready(() => {
    $('#status-form').submit((event) => {
        event.preventDefault();
        $.ajax({
            url: '/users/status',
            method: 'POST',
            data: { status: $('#status').find(':selected').val() },
            dataType: 'json',
            success: () => {
                socket.emit('userStatus', {});
                location.reload();
            },
            error: (err) => {
                console.error('status update somehow error', err);
            },
        });
    });
});
