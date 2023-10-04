console.log('in status.js!!! on the client side, that is');

var socket = io();

// this particular client is online!
socket.emit('online', { message: 'hi' });

// Function to sort and display users based on status and username
function sortAndDisplayUsers() {
    const userElements = Array.from(
        document.querySelectorAll('.user-list-body-element'),
    );

    console.log('User elements ');
    console.log(userElements);

    userElements.sort((a, b) => {
        const usernameA = a.querySelector(
            '.user-list-body-element-name',
        ).textContent;
        const usernameB = b.querySelector(
            '.user-list-body-element-name',
        ).textContent;

        const statusA = document.getElementById(
            `user-status-${usernameA}`,
        ).textContent;
        const statusB = document.getElementById(
            `user-status-${usernameB}`,
        ).textContent;

        console.log('username A: ' + usernameA + ' username B: ' + usernameB);
        console.log('status A: ' + statusA + ' status B: ' + statusB);

        // Prioritize online users over offline users
        if (statusA === 'ONLINE' && statusB === 'OFFLINE') {
            console.log('Online placed first');
            return -1; // Online users come first
        } else if (statusA === 'OFFLINE' && statusB === 'ONLINE') {
            console.log('Online placed first');
            return 1; // Online users come first
        } else {
            // If statuses are the same, sort alphabetically by username
            console.log('Sorting alphabetically');
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

// Listen for 'userStatus'
// let me know if someone else's status changes
socket.on('userStatus', (data) => {
    const { username, status } = data;
    console.log('the status for ' + username + ' is ' + status);

    // Use a unique ID for each user's status element
    const statusElement = document.getElementById(`user-status-${username}`);

    // Change the status placeholder to real-time status
    if (statusElement) {
        statusElement.textContent = status;
        if (status === 'ONLINE') {
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
    }

    // TODO: reorder elements such that they are
    // alphabetical by ONLINE then alphabetical by OFFLINE
    sortAndDisplayUsers();
    // set the change in the HTML
});
