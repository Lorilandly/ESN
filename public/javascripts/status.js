/* global socket */

function createUserElement(username, loginStatus, status) {
    // Create a new new user list body element
    const newUserListElement = document.createElement('div');
    newUserListElement.setAttribute('class', 'user-list-body-element');

    // Create a new status element
    const newStatusElement = document.createElement('div');
    newStatusElement.setAttribute('id', `user-status-${username}`);

    // Set the status for current user
    if (loginStatus === 'ONLINE') {
        newStatusElement.setAttribute(
            'class',
            'user-list-body-element-status-online',
        );
    } else {
        newStatusElement.setAttribute(
            'class',
            'user-list-body-element-status-offline',
        );
    }

    newStatusElement.textContent = loginStatus;

    // Create a new username element
    const newUserElement = document.createElement('div');
    newUserElement.setAttribute('class', 'user-list-body-element-name');
    const newUsernameElement = document.createElement('span');
    newUsernameElement.setAttribute(
        'class',
        'user-list-body-element-name-username',
    );
    newUsernameElement.textContent = username;
    const newUserStatusElement = document.createElement('i');
    newUserStatusElement.setAttribute(
        'class',
        'bi bi-circle-fill user-status-' + status,
    );

    const chatHolder = document.createElement('div');
    chatHolder.className = 'user-list-body-element-chat';

    // Append the new username and status element to the user list element container
    newUserElement.appendChild(newUsernameElement);
    newUserElement.appendChild(newUserStatusElement);
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

// window.addEventListener('beforeunload', (event) => {
//     // Check if the window is being closed intentionally
//     socket.emit('window-close');
// });
