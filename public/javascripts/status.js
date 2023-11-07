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

function createStatusElement(username, loginStatus) {
    const statusElement = document.createElement('div');
    statusElement.setAttribute('id', `user-status-${username}`);
    statusElement.setAttribute(
        'class',
        loginStatus === 'ONLINE' ? 'user-list-body-element-status-online' : 'user-list-body-element-status-offline'
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
            const newUserListElement = createUserElement({
                username: username,
                loginStatus: loginStatus,
                status: status,
            });
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
