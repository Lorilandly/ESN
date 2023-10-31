/* global io */
var socket = io(); // eslint-disable-line

function getReceiverIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return parseInt(pathSegments[2]);
}

const otherId = getReceiverIdFromPath();

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
        url: '/messages/private',
        method: 'GET',
        dataType: 'json',
        data: { receiverId: otherId },
        success: (response) => {
            const messages = response.messages;
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
    $('#messageForm').submit(async (event) => {
        event.preventDefault();

        const messageBody = $('#message').val();

        $.ajax('/messages/private', {
            method: 'POST',
            data: { message: messageBody, receiverId: otherId },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });
    });

    socket.on(
        'create private message',
        async ({ username, time, status, body, userId, receiverId }) => {
            const senderId = userId;
            const user = await getCurrentUser();
            const currentId = user.id;
            if (!(currentId === receiverId || currentId === senderId)) {
                return;
            }
            const messageList = $('#message-container');
            const message = document.createElement('div');
            message.classList.add('message');
            message.innerHTML = `
                    <div class="message-title">
                        <span class="message-sender-name">${username}</span>
                        <span class="message-time">${time}</span>
                        <span class="message-status">${status}</span>
                    </div>
                    <div class="message-body">
                        <p>${body}</p>
                    </div>
                `;
            messageList.append(message);
            messageList.scrollTop(messageList[0].scrollHeight);
            $('#message').val('');
        },
    );
});
