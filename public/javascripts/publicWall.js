var socket = io();

$(document).ready(() => {
    // Capture form submission event
    $('#logout-form').submit((event) => {
        event.preventDefault();
        $.ajax('/users/logout', {
            method: 'PUT',
            datatype: 'json',
            success: () => {
                location.href = '/';
            },
            error: (res) => {
                console.error('Login error:', res);
            },
        });
    });

    // Fetch and render all messages
    $.ajax({
        url: '/messages/public',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            let messages = response.messages;
            if (messages && messages.length > 0) {
                let messageHtml = '';
                messages.forEach((message) => {
                    messageHtml += `
                        <div class="message">
                            <div class="message-title">
                                <span class="message-sender-name">${message.username}<i class="bi bi-circle-fill user-status-${message.status}"></i></span>
                                <span class="message-time">${message.time}</span>
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
        $.ajax('/messages/public', {
            method: 'POST',
            data: { message: messageBody },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });
    });

    socket.on('create public message', ({ username, time, status, body }) => {
        let messageList = $('#message-container');
        let message = document.createElement('div');
        message.innerHTML = `
        <div class="message">
            <div class="message-title">
                <span class="message-sender-name">${username}<i class="bi bi-circle-fill user-status-${status}"></i></span>
                <span class="message-time">${time}</span>
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
