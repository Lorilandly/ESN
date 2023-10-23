var socket = io();

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
            error: (res) => {
                console.error('Login error:', res);
            },
        });
    });

    // Fetch and render all messages
    $.ajax({
        url: '/publicMessages',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            let messages = response.messages;
            if (messages && messages.length > 0) {
                let messageHtml = '';
                messages.forEach((message) => {
                    let status;
                    switch (message.status) {
                        case 'OK':
                            status = ' - 🟢';
                            break;
                        case 'HELP':
                            status = ' - 🟡';
                            break;
                        case 'EMERGENCY':
                            status = ' - 🔴';
                            break;
                        default:
                            status = '';
                            break;
                    }
                    messageHtml += `
                        <div class="message">
                            <div class="message-title">
                                <span class="message-sender-name">${message.username}${status}</span>
                                <span class="message-time">${message.time}</span>
                                <!--<span class="message-status">${message.status}</span>-->
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
        $.ajax('/publicMessages', {
            method: 'POST',
            data: { message: messageBody },
            dataType: 'json', // Specify the response data type
            error: (error) => {
                console.error('API Error:', error);
            },
        });
    });

    socket.on('create message', ({ username, time, status, body }) => {
        let messageList = $('#message-container');
        let message = document.createElement('div');
        switch (status) {
            case 'OK':
                status = ' - 🟢';
                break;
            case 'HELP':
                status = ' - 🟡';
                break;
            case 'EMERGENCY':
                status = ' - 🔴';
                break;
            default:
                status = '';
                break;
        }
        message.innerHTML = `
        <div class="message">
            <div class="message-title">
                <span class="message-sender-name">${username}${status}</span>
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
