var socket = io();

function getCurrentUserId() {
    return new Promise((resolve, reject) => {
        $.ajax('/users/current', {
            method: 'GET',
            datatype: 'json',
            success: (response) => {
                resolve(response.userId);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

$(document).ready(function () {
    getCurrentUserId().then((currentId) => {
        $.ajax({
            url: '/messages/private/new',
            method: 'GET',
            dataType: 'json',
            data: { receiverId: currentId },
            success: (response) => {
                let messages = response.messages;
                if (messages && messages.length > 0) {
                    $("#alert-container").addClass("visible");
                }
            },
            error: (error) => {
                console.error('Failed to fetch messages:', error);
            },
        })
    });
    
    socket.on('new message', () => {
        $("#alert-container").addClass("visible");
    })

    socket.on('new messages viewed', () => {
        $("#alert-container").removeClass("visible");
    })

});