/* global socket */

// Function to sort and display users based on status and username
function sortAndDisplayUsers() {
    const userElements = Array.from(
        document.querySelectorAll('.user-list-body-element'),
    );

    userElements.sort((a, b) => {
        const usernameA = a.querySelector(
            '.user-list-body-element-name-username',
        ).textContent;
        const usernameB = b.querySelector(
            '.user-list-body-element-name-username',
        ).textContent;

        const statusA = document.getElementById(
            `user-status-${usernameA}`,
        ).textContent;
        const statusB = document.getElementById(
            `user-status-${usernameB}`,
        ).textContent;

        // Prioritize online users over offline users
        if (statusA === 'ONLINE' && statusB === 'OFFLINE') {
            return -1; // Online users come first
        } else if (statusA === 'OFFLINE' && statusB === 'ONLINE') {
            return 1; // Online users come first
        } else {
            // If statuses are the same, sort alphabetically by username
            return usernameA.localeCompare(usernameB); // Sort by username
        }
    });

    const userList = document.querySelector('.user-list-body');
    // Clear the existing list
    while (userList.hasChildNodes()) {
        userList.removeChild(userList.firstChild);
    }

    // Append the sorted user elements back to the list
    userElements.forEach((userElement) => {
        userList.appendChild(userElement.cloneNode(true));
    });
}

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
    socket.on('userStatus', (data) => {
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
