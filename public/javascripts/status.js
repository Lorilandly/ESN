/* global socket fetchUserList */

function createStatusElement(username, loginStatus) {
    const statusElement = document.createElement('div');
    statusElement.setAttribute('id', `user-status-${username}`);
    statusElement.setAttribute(
        'class',
        loginStatus === 'ONLINE'
            ? 'user-list-body-element-status-online'
            : 'user-list-body-element-status-offline',
    );
    statusElement.textContent = loginStatus;
    return statusElement;
}

function createUsernameElement(username) {
    const usernameElement = document.createElement('div');
    usernameElement.setAttribute('class', 'user-list-body-element-name');
    const usernameSpan = document.createElement('span');
    usernameSpan.setAttribute('class', 'user-list-body-element-name-username');
    usernameSpan.textContent = username;
    usernameElement.appendChild(usernameSpan);
    return usernameElement;
}

function createUserStatusIcon(status) {
    const statusIcon = document.createElement('i');
    statusIcon.setAttribute('class', `bi bi-circle-fill user-status-${status}`);
    return statusIcon;
}

function createUserElement(user) {
    const { username, loginStatus, status } = user;

    const newUserListElement = document.createElement('div');
    newUserListElement.setAttribute('class', 'user-list-body-element');

    const newStatusElement = createStatusElement(username, loginStatus);
    const newUserElement = createUsernameElement(username);
    newUserElement.appendChild(createUserStatusIcon(status));

    const chatHolder = document.createElement('div');
    chatHolder.className = 'user-list-body-element-chat';

    newUserListElement.appendChild(newUserElement);
    newUserListElement.appendChild(newStatusElement);
    newUserListElement.appendChild(chatHolder);

    return newUserListElement;
}

// Listen for 'userStatus'
// Notice all other clients if someone else's status changes
$(document).ready(() => {
    socket.on('userStatus', () => {
        // clear the user list first
        const userList = document.querySelector('.user-list-body');
        // Clear the existing list
        while (userList.hasChildNodes()) {
            userList.removeChild(userList.firstChild);
        }
        // Add the current user back to the list
        fetchUserList();
    });
});
