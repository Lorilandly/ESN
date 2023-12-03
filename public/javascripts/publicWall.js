/* global socket setSearchType modifyHeader */

$(document).ready(() => {
    modifyHeader(true, 'Public Chat');
    document.getElementById('public-chat').classList.add('text-primary');
    // Set Search Bar Title to Search Public Messages
    $('#searchModalLabel').html('Search Public Messages');
    setSearchType('public');
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('id', 'search-input');
    searchInput.setAttribute('class', 'form-control');
    searchInput.setAttribute('placeholder', 'Search Public Messages');
    document.getElementById('search-input-body').appendChild(searchInput);
    // Fetch and render all messages
    $.ajax({
        url: '/messages/public',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            const messages = response.messages;
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
        const messageBody = $('#message').val();

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
        const messageList = $('#message-container');
        const message = document.createElement('div');
        message.className = 'message';
        message.innerHTML = `
            <div class="message-title">
                <span class="message-sender-name">${username}<i class="bi bi-circle-fill user-status-${status}"></i></span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-body">
                <p>${body}</p>
            </div>
        `;
        messageList.append(message);
        messageList.scrollTop(messageList[0].scrollHeight);
        $('#message').val('');
    });
});
