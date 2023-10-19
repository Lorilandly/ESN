var socket = io();

function getSenderIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[2];
}

function getReceiverIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[3];
}

$(document).ready(() => {
    // Capture form submission event
    $('#logout-form').submit((event) => {
        event.preventDefault(); // Prevent the default form submission
        $.ajax('/users/logout', {
            method: 'PUT',
            datatype: 'json',
            success: () => {
                location.href = '/';
            },
            error: (_) => {
                console.error('Login error:', res);
            },
        });
    });

    let senderId = getSenderIdFromPath();
    let receiverId = getReceiverIdFromPath();

    // Fetch and render all messages
    //
    $.ajax({
        url: '/messages/private',
        method: 'GET',
        dataType: 'json',
        data: { senderId: senderId, receiverId: receiverId },
        success: (response) => {
            let messages = response.messages;
            if (messages && messages.length > 0) {
                let messageHtml = '';
                messages.forEach((message) => {
                    messageHtml += `
                        <div class="message">
                            <div class="message-title">
                                <span class="message-sender-name">${message.sender_name}</span>
                                <span class="message-time">${message.time}</span>
                                <span class="message-status">${message.status}</span>
                            </div>
                            <div class="message-body">
                                <p>${message.body}</p>
                            </div>
                        </div>`;
                });
                $('#message-container').append(messageHtml);
                $('#message-container').scrollTop(
                    $('#message-container')[0].scrollHeight,
                );
            }
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });

    // Capture form submission event
    $('#messageForm').submit((event) => {
        event.preventDefault();

        // Get the message body from the input field
        let messageBody = $('#message').val();

        // Create message by calling API
        $.ajax('/messages/private', {
            method: 'POST',
            data: { message: messageBody, receiverId: receiverId },
            dataType: 'json', // Specify the response data type
            error: (error) => {
                console.error('API Error:', error);
            },
        });
    });

    socket.on('create message', ({ username, time, status, body }) => {
        let messageList = $('#message-container');
        let message = document.createElement('div');
        message.innerHTML = `
        <div class="message">
            <div class="message-title">
                <span class="message-sender-name">${username}</span>
                <span class="message-time">${time}</span>
                <span class="message-status">${status}</span>
            </div>
            <div class="message-body">
                <p>${body}</p>
            </div>
        </div>
        `;
        messageList.append(message);
        messageList.scrollTop(messageList[0].scrollHeight);
        $('#message').val('');
    });
});
