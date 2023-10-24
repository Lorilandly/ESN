var socket = io();

function getCurrentUser() {
    return new Promise((resolve, reject) => {
        $.ajax('/users/current', {
            method: 'GET',
            datatype: 'json',
            success: (response) => {
                resolve(response);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

$(document).ready(() => {
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

    socket.on(
        'create private message',
        async ({ username, time, status, body, userId, receiverId }) => {
            let senderId = userId;
            let user = await getCurrentUser();
            let currentId = user.id;
            // Parsing issue so use == instead of ===, fix later!
            if (currentId == receiverId) {
                $('#alert-container').addClass('visible');
            }
        },
    );
});
