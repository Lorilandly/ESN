/* global io otherId */
const socket = io();

$(document).ready(() => {
    window.user = getCurrentUser();
    $.ajax({
        url: '/messages/private/new',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            const messages = response.messages;
            if (messages && messages.length) {
                showNewMessageWarning(true);
                const groupedMessages = {};
                // store reciever id
                const receiverId = messages[0].receiver_id;
                const senderId = messages[0].sender_id;
                $('#receiver_id').text(receiverId);
                // Group messages by sender name
                messages.forEach((message) => {
                    if (!groupedMessages[message.sender_name]) {
                        groupedMessages[message.sender_name] = [];
                    }
                    groupedMessages[message.sender_name].push(message);
                });

                for (const sender in groupedMessages) {
                    let messageHtml = '';
                    groupedMessages[sender].forEach((message) => {
                        messageHtml += `
                        <form class = "message-form message-alert" action = '/privateChat/${senderId}' method = 'GET'>
                            <button type="submit" class="btn btn-${getStatusColor(
        message.status,
    )}" onclick="clearMessage(this)">
                                <div class="message-title">
                                    <span class="message-sender-name">${
    message.sender_name
}</span>
                                    <span class="message-time">${
    message.time
}</span>
                                    <span class="message-status">${
    message.status
}</span>
                                </div>
                                <div class="message-body">
                                    <span>${message.body}</span>
                                </div>
                            </button>
                        </form>`;
                    });
                    $('#alert-container').append(messageHtml);
                }
            }
        },
    });

    socket.on(
        'create private message',
        async ({ username, time, status, body, userId, receiverId }) => {
            const senderId = userId;
            const user = await window.user;
            const currentId = user.id;
            // Parsing issue so use == instead of ===, fix later!
            if (currentId === receiverId) {
                shakeIndicator();
                showNewMessageWarning(true);
                // append message to alert container
                const messageHtml = `
                <form class = "message-form message-alert" action = '/privateChat/${senderId}' method = 'GET'>
                    <button type="submit" class="btn btn-${getStatusColor(
        status,
    )}" onclick="clearMessage(this)">
                        <div class="message-title">
                            <span class="message-sender-name">${username}</span>
                            <span class="message-time">${time}</span>
                            <span class="message-status">${status}</span>
                        </div>
                        <div class="message-body">
                            <span>${body}</span>
                        </div>
                    </button>
                </form>`;
                $('#alert-container').append(messageHtml);
            }
        },
    );

    const offcanvasElement = document.getElementById('offcanvasAlert');
    offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
        // remove all the messages
        $('#alert-container').empty();
        changeReadStatus();
        showNewMessageWarning(false);
    });

    socket.on('user inactive', async ({ userID }) => {
        console.log('user inactive', userID);
        const currentUser = await getCurrentUser();
        if (parseInt(currentUser.id, 10) === parseInt(userID, 10)) {
            alert('Your account has been deactivated');
            $.ajax('/users/logout', {
                method: 'PUT',
                datatype: 'json',
                data: { type: 'logout' },
                success: () => {
                    location.href = '/';
                },
                error: (res) => {
                    console.error('Login error:', res);
                },
            });
        }
    });
});

function shakeIndicator() {
    const indicator = document.getElementById('notification');
    indicator.style.animation = 'shake 0.1s';
    indicator.style.animationIterationCount = '5';

    indicator.addEventListener('animationend', () => {
        indicator.style.animation = '';
    });
}
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

function setSearchType(type) {
    localStorage.setItem('searchType', type);
}

async function changeReadStatus() {
    const receiverId = await window.user;
    $.ajax('/messages/private/readStatus', {
        method: 'PUT',
        datatype: 'json',
        data: { receiverId: receiverId.id },
        success: () => {},
        error: (error) => {
            console.error('Failed to update messages read status:', error);
        },
    });
}

function getStatusColor(status) {
    let color = '';
    if (status === 'OK') {
        color = 'success';
    } else if (status === 'EMERGENCY') {
        color = 'danger';
    } else if (status === 'HELP') {
        color = 'warning';
    } else {
        color = 'info';
    }
    return color;
}

function showNewMessageWarning(state) {
    // get element notification-icon
    const indicator = document.getElementById('notification-icon');
    // remove text-light class
    if (state) {
        indicator.classList.remove('text-light');
        // add text-warning class
        indicator.classList.add('text-warning');
    } else {
        indicator.classList.remove('text-warning');
        // add text-light class
        indicator.classList.add('text-light');
    }
}

async function searchInformation() {
    const searchType = localStorage.getItem('searchType');
    const searchInput = document.getElementById('search-input').value;
    let searchCriteria = null;
    let userIdOne = null;
    let userIdTwo = null;
    try {
        searchCriteria = document.getElementById('citizen-search-type').value;
    } catch (err) {
        searchCriteria = null;
    }
    try {
        userIdOne = otherId;
        userIdTwo = (await window.user).id;
    } catch (err) {
        userIdOne = null;
        userIdTwo = null;
    }
    $.ajax({
        url: '/search',
        method: 'GET',
        dataType: 'json',
        data: {
            context: searchType,
            input: searchInput,
            criteria: searchCriteria,
            user0: userIdOne,
            user1: userIdTwo,
        },
        success: (response) => {
            // Close searchModal
            switch (searchType) {
                case 'citizen':
                    showCitizenSearchResults(response);
                    break;
                case 'public':
                    showChatSearchResults(response);
                    break;
                case 'private':
                    if (response.type === 'status') {
                        showChatSearchStatus(response);
                    } else {
                        showChatSearchResults(response);
                    }
                    break;
            }
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });
}

function showCitizenSearchResults(responses) {
    // Remove everything from search-result
    $('#search-result').empty();
    const users = responses.users;
    users.forEach((user) => {
        const bodyElement = document.createElement('div');
        bodyElement.className = 'search-user-list-body-element';
        const nameElement = document.createElement('div');
        nameElement.className = 'search-user-list-body-element-name';
        const usernameElement = document.createElement('span');
        usernameElement.className =
            'search-user-list-body-element-name-username';
        usernameElement.innerHTML = user.username;
        const statusElement = document.createElement('i');
        statusElement.className =
            'bi bi-circle-fill user-status-' + user.status;
        const loginStatusElement = document.createElement('div');
        if (user.loginStatus === 'ONLINE') {
            loginStatusElement.className =
                'search-user-list-body-element-status-online';
        } else {
            loginStatusElement.className =
                'search-user-list-body-element-status-offline';
        }
        loginStatusElement.innerHTML = user.loginStatus;
        nameElement.appendChild(usernameElement);
        nameElement.appendChild(statusElement);
        bodyElement.appendChild(nameElement);
        bodyElement.appendChild(loginStatusElement);
        document.getElementById('search-result').appendChild(bodyElement);
    });
}

function showChatSearchResults(response) {
    displaySearchMessages(response.messages, 'message');
}

function showChatSearchStatus(response) {
    displaySearchMessages(response.messages, 'status');
}

function displaySearchMessages(messages, type) {
    $('#search-result').empty();
    if (messages && messages.length > 0) {
        let messageHtml = '';
        messages.forEach((message) => {
            messageHtml += `
            <div class="search-message">
                <div class="search-message-title">
                `;
            if (type === 'status') {
                messageHtml += `
                    <span class="search-message-sender-name">${message.time}</span>
                    <span class="message-status">${message.status}</span>
                `;
            } else {
                messageHtml += `
                    <span class="search-message-sender-name">${message.sender}</span>
                    <span class="message-time">${message.time}</span>
                    <span class="message-status">${message.status}</span>
                    </div>
                    <div class="message-body">
                            <p>${message.body}</p>
                    </div>
                `;
            }
            messageHtml += `
            </div>`;
        });
        $('#search-result').append(messageHtml);
    }
}

function modifyHeader(search, title) {
    if (!search) {
        document.getElementById('search-bar').remove();
    }
    document.getElementsByClassName('header-text')[0].innerHTML = title;
}

window.addEventListener('beforeunload', (event) => {
    $.ajax('/users/logout', {
        method: 'PUT',
        datatype: 'json',
        data: { type: 'close' },
    });
});

function displayChatMessages(messages) {
    if (messages && messages.length > 0) {
        let messageHtml = '';
        messages.forEach((message) => {
            messageHtml += `
                <div class="message">
                    <div class="message-title">
                        <span class="message-sender-name">${message.sender_name}<i class="bi bi-circle-fill user-status-${message.status}"></i></span>
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
}
