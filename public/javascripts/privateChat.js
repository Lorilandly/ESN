/* global socket setSearchType getCurrentUser displayChatMessages */

function getReceiverIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return parseInt(pathSegments[2]);
}

const otherId = getReceiverIdFromPath();

$(document).ready(async () => {
    // Set Search Bar Title to Search Private Messages
    $('#searchModalLabel').html('Search Private Messages');
    setSearchType('private');
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('id', 'search-input');
    searchInput.setAttribute('class', 'form-control');
    searchInput.setAttribute('placeholder', 'Search Private Messages');
    document.getElementById('search-input-body').appendChild(searchInput);
    document.getElementsByClassName('header-text')[0].innerHTML = 'Private Chat';
    // Fetch and render all messages
    $.ajax({
        url: '/messages/private',
        method: 'GET',
        dataType: 'json',
        data: { receiverId: otherId },
        success: (response) => {
            displayChatMessages(response.messages);
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
        async ({ username, time, status, body, senderId, receiverId }) => {
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
