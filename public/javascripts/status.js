/* global io */
var socket = io(); // eslint-disable-line

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
        const { username, loginStatus, status } = data;

        // Use a unique ID for each user's status element
        const statusElement = document.getElementById(
            `user-status-${username}`,
        );
        // Change the status to real-time status
        // If the current user is somone already in the ESN directory
        if (statusElement) {
            // Based on the real-time status, set the corresponding class attribute
            statusElement.textContent = loginStatus;
            if (loginStatus === 'ONLINE') {
                statusElement.setAttribute(
                    'class',
                    'user-list-body-element-status-online',
                );
            } else {
                statusElement.setAttribute(
                    'class',
                    'user-list-body-element-status-offline',
                );
            }
        } else {
            // If the current user is a first-time user just joined
            // Select the user list body class, which will append the new user list body element
            const userListContainer = document.querySelector('.user-list-body');

            // Append this new user list element to the entire user list
            const newUserListElement = createUserElement(username, loginStatus, status);
            userListContainer.appendChild(newUserListElement);
        }

        // alphabetical by ONLINE then alphabetical by OFFLINE
        sortAndDisplayUsers();
    });
});

window.addEventListener('beforeunload', (event) => {
    // Check if the window is being closed intentionally
    socket.emit('window-close');
});
