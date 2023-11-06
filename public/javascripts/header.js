/* global io */
var socket = io(); // eslint-disable-line

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

async function changeReadStatus() {
    //
    const receiverId = await getCurrentUser();
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

function setSearchType(type) {
    localStorage.setItem('searchType', type);
}

$(document).ready(() => {
    $.ajax({
        url: '/messages/private/new',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            const messages = response.messages;
            if (messages && messages.length) {
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
                        <div class="message">
                            <form class = "message-form" action = '/privateChat/${senderId}' method = 'GET'>
                                <button type="submit" class="btn btn-primary" onclick="clearMessage(this)">
                                    <div class="message-title">
                                        <span class="message-sender-name">${message.sender_name}</span>
                                        <span class="message-time">${message.time}</span>
                                        <span class="message-status">${message.status}</span>
                                    </div>
                                    <div class="message-body">
                                        <span>${message.body}</span>
                                    </div>
                                </button>
                            </form>
                        </div>`;
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
            const user = await getCurrentUser();
            const currentId = user.id;
            // Parsing issue so use == instead of ===, fix later!
            if (currentId === receiverId) {
                shakeIndicator();
                // append message to alert container
                const messageHtml = `
                <div class="message">
                    <form class = "message-form" action = '/privateChat/${senderId}' method = 'GET'>
                        <button type="submit" class="btn btn-primary" onclick="clearMessage(this)">
                            <div class="message-title">
                                <span class="message-sender-name">${username}</span>
                                <span class="message-time">${time}</span>
                                <span class="message-status">${status}</span>
                            </div>
                            <div class="message-body">
                                <span>${body}</span>
                            </div>
                        </button>
                    </form>
                </div>`;
                $('#alert-container').append(messageHtml);
            }
        },
    );

    const offcanvasElement = document.getElementById('offcanvasAlert');

    offcanvasElement.addEventListener('hidden.bs.offcanvas', function (event) {
        // remove all the messages
        $('#alert-container').empty();
        changeReadStatus();
    });
});

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
    try{
        userIdOne = otherId;
        userIdTwo = (await getCurrentUser()).id;
    }
    catch(err){
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
            switch(searchType){
                case 'citizen':
                    showCitizenSearchResults(response);
                    break;
                case 'public':
                    showChatSearchResults(response);
                    break;
                case 'private':
                    showChatSearchResults(response);
                    break;
            }
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });
}

function showCitizenSearchResults(responses){
    // Remove everything from search-result
    $('#search-result').empty();
    const users = responses.users;
    users.forEach((user) => {
        let bodyElement = document.createElement('div');
        bodyElement.className = 'search-user-list-body-element';
        let nameElement = document.createElement('div');
        nameElement.className = 'search-user-list-body-element-name';
        let usernameElement = document.createElement('span');
        usernameElement.className = 'search-user-list-body-element-name-username';
        usernameElement.innerHTML = user.username;
        let statusElement = document.createElement('i');
        statusElement.className = 'bi bi-circle-fill user-status-' + user.status;
        let loginStatusElement = document.createElement('div');
        if (user.loginStatus === 'ONLINE') {
            loginStatusElement.className = 'search-user-list-body-element-status-online';
        }
        else {
            loginStatusElement.className = 'search-user-list-body-element-status-offline';
        }
        loginStatusElement.innerHTML = user.loginStatus;
        nameElement.appendChild(usernameElement);
        nameElement.appendChild(statusElement);
        bodyElement.appendChild(nameElement);
        bodyElement.appendChild(loginStatusElement);
        document.getElementById('search-result').appendChild(bodyElement);
    })
}

function showChatSearchResults(response){
    // Remove everything from search-result
    $('#search-result').empty();
    const messages = response.messages;
    if (messages && messages.length > 0) {
        let messageHtml = '';
        messages.forEach((message) => {
            messageHtml += `
                <div class="search-message">
                    <div class="search-message-title">
                        <span class="search-message-sender-name">${message.sender}</span>
                        <span class="message-time">${message.time}</span>
                        <span class="message-status">${message.status}</span>
                    </div>
                    <div class="message-body">
                        <p>${message.body}</p>
                    </div>
                </div>`;
        });
        $('#search-result').append(messageHtml);
    }
}