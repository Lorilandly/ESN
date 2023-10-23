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

function createReplyButton(senderId, receiverId) {
    // Create the form element
    const form = document.createElement('form');
    form.action = '/privateChat/' + senderId + '/' + receiverId;
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

    getCurrentUserId().then(async (currentId) => {
        // Fetch and render all unread messages
        return $.ajax({
            url: '/messages/private/new',
            method: 'GET',
            dataType: 'json',
            data: { receiverId: currentId },
            success: (response) => {
                let messages = response.messages;
                let groupedMessages = {};

                // Group messages by sender name
                messages.forEach((message) => {
                    if (!groupedMessages[message.sender_name]) {
                        groupedMessages[message.sender_name] = [];
                    }
                    groupedMessages[message.sender_name].push(message);
                });

                // Render messages grouped by sender name
                for (let sender in groupedMessages) {
                    let senderId = groupedMessages[sender][0].sender_id;
                    let receiverId = groupedMessages[sender][0].receiver_id;
                    let button = createReplyButton(receiverId, senderId);
                    let senderDiv = $('<div>').addClass('sender');
                    let senderText = $('<span>').text(sender);
                    senderDiv.append(senderText);
                    senderDiv.append(button);
                    $('#message-container').append(senderDiv); // Assuming you have a container div with id="container"

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
    });
});
