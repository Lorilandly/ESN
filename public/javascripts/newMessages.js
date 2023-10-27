/* global io */
const socket = io();

function createReplyButton(senderId, receiverId) {
    // Create the form element
    const form = document.createElement('form');
    form.action = '/privateChat/' + receiverId;
    form.method = 'get';

    // Create the button inside the form
    const chatButton = document.createElement('button');
    chatButton.type = 'submit';
    chatButton.innerText = 'Reply';
    chatButton.setAttribute('class', 'reply-button');

    // Append the button to the form
    form.appendChild(chatButton);
    return form;
}

$(document).ready(() => {
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

    // Fetch and render all unread messages
    $.ajax({
        url: '/messages/private/new',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            const messages = response.messages;
            const groupedMessages = {};
            // Group messages by sender name
            messages.forEach((message) => {
                if (!groupedMessages[message.sender_name]) {
                    groupedMessages[message.sender_name] = [];
                }
                groupedMessages[message.sender_name].push(message);
            });

            // Render messages grouped by sender name
            for (const sender in groupedMessages) {
                const senderId = groupedMessages[sender][0].sender_id;
                const receiverId = groupedMessages[sender][0].receiver_id;
                const button = createReplyButton(receiverId, senderId);
                const senderDiv = $('<div>').addClass('sender');
                const senderText = $('<span>').text(sender);
                senderDiv.append(senderText);
                senderDiv.append(button);
                $('#message-container').append(senderDiv);
                let messageHtml = '';
                groupedMessages[sender].forEach((message) => {
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
            }
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    }).then(async (response) => {
        if (response.messages && response.messages.length > 0) {
            $.ajax('/messages/private/readStatus', {
                method: 'PUT',
                datatype: 'json',
                data: { receiverId: response.messages[0].receiver_id },
                success: () => {},
                error: (error) => {
                    console.error(
                        'Failed to update messages read status:',
                        error,
                    );
                },
            });
        }
    });

    socket.on(
        'create private message',
        async ({ username, time, status, body, userId, receiverId }) => {
            const user = await getCurrentUser();
            const currentId = user.id;
            // Parsing issue so use == instead of ===, fix later!
            if (currentId == receiverId) {
                $('#alert-container').css('display', 'flex');
            }
        },
    );
});
