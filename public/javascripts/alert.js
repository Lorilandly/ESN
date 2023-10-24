var socket = io();

$(document).ready(function () {
    $.ajax({
        url: '/messages/private/new',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            let messages = response.messages;
            if (messages && messages.length > 0) {
                $('#alert-container').addClass('visible');
            }
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });

    socket.on('create private message', () => {
        $('#alert-container').addClass('visible');
    });

    socket.on('new messages viewed', () => {
        $('#alert-container').removeClass('visible');
    });
});
