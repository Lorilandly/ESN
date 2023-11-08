/* global setSearchType */
function createPrivateChatButton(senderId, receiverId) {
    // Create the form element
    const form = document.createElement('form');
    form.className = 'user-list-body-element-chat-form';
    form.action = '/privateChat/' + receiverId;
    form.method = 'get';

    // Create the button inside the form
    const chatButton = document.createElement('button');
    chatButton.setAttribute('type', 'submit');
    chatButton.setAttribute('class', 'chat-button');

    // Create the icon inside the button
    const chatIcon = document.createElement('i');
    chatIcon.setAttribute('class', 'bi bi-chat-left-text');
    chatButton.appendChild(chatIcon);

    // Append the button to the form
    form.appendChild(chatButton);
    return form;
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

$(document).ready(() => {
    // Set Search Bar Title to Search Citizens
    $('#searchModalLabel').html('Search Citizens');
    setSearchType('citizen');
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('id', 'search-input');
    searchInput.setAttribute('class', 'form-control');
    searchInput.setAttribute('placeholder', 'Search Citizens');
    const searchSelect = document.createElement('select');
    searchSelect.setAttribute('id', 'citizen-search-type');
    searchSelect.setAttribute('class', 'form-select');
    const searchOption1 = document.createElement('option');
    searchOption1.setAttribute('value', 'username');
    searchOption1.innerHTML = 'Name';
    const searchOption2 = document.createElement('option');
    searchOption2.setAttribute('value', 'status');
    searchOption2.innerHTML = 'Status';
    searchSelect.appendChild(searchOption1);
    searchSelect.appendChild(searchOption2);
    document.getElementById('search-input-body').appendChild(searchInput);
    document.getElementById('search-input-body').appendChild(searchSelect);

    searchSelect.addEventListener('change', (event) => {
        // Remove the search-input element
        document
            .getElementById('search-input-body')
            .removeChild(document.getElementById('search-input'));
        if (event.target.value === 'status') {
            const searchInput = document.createElement('select');
            searchInput.setAttribute('id', 'search-input');
            searchInput.setAttribute('class', 'form-select');
            searchInput.style.width = '100%';
            const searchOption1 = document.createElement('option');
            searchOption1.setAttribute('value', 'OK');
            searchOption1.innerHTML = 'OK';
            const searchOption2 = document.createElement('option');
            searchOption2.setAttribute('value', 'EMERGENCY');
            searchOption2.innerHTML = 'EMERGENCY';
            const searchOption3 = document.createElement('option');
            searchOption3.setAttribute('value', 'HELP');
            searchOption3.innerHTML = 'HELP';
            const searchOption4 = document.createElement('option');
            searchOption4.setAttribute('value', 'UNDEFINED');
            searchOption4.innerHTML = 'UNDEFINED';
            searchInput.appendChild(searchOption1);
            searchInput.appendChild(searchOption2);
            searchInput.appendChild(searchOption3);
            searchInput.appendChild(searchOption4);
            const searchInputBody =
                document.getElementById('search-input-body');
            searchInputBody.insertBefore(
                searchInput,
                searchInputBody.children[0],
            );
        } else {
            const searchInput = document.createElement('input');
            searchInput.setAttribute('type', 'text');
            searchInput.setAttribute('id', 'search-input');
            searchInput.setAttribute('class', 'form-control');
            searchInput.setAttribute('placeholder', 'Search Citizens');
            const searchInputBody =
                document.getElementById('search-input-body');
            searchInputBody.insertBefore(
                searchInput,
                searchInputBody.children[0],
            );
        }
    });

    fetchUserList();
});

function fetchUserList() {
    // Get user list from API
    $.ajax('/users', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const currentUser = await getCurrentUser();
            const listbody = document.getElementById('user-list-body');
            for (const i in res) {
                const user = createUserList(res[i], currentUser);
                if (user) {
                    listbody.appendChild(user);
                }
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function createUserList(user, currentUser) {
    const userId = document.getElementById(`user-status-${user.username}`);
    if (!userId) {
        const element = document.createElement('div');
        element.className = 'user-list-body-element';
        const name = document.createElement('div');
        name.className = 'user-list-body-element-name';
        const username = document.createElement('span');
        username.className = 'user-list-body-element-name-username';
        username.innerHTML = user.username;
        const status = document.createElement('i');
        status.className = 'bi bi-circle-fill user-status-' + user.status;
        const loginStatus = document.createElement('div');
        const chatHolder = document.createElement('div');
        chatHolder.className = 'user-list-body-element-chat';

        if (user.login_status === 'ONLINE') {
            loginStatus.className = 'user-list-body-element-status-online';
        } else {
            loginStatus.className = 'user-list-body-element-status-offline';
        }
        loginStatus.id = `user-status-${user.username}`;
        loginStatus.innerHTML = user.login_status;

        element.appendChild(name);
        element.appendChild(loginStatus);

        if (user.username !== currentUser.username) {
            chatHolder.appendChild(
                createPrivateChatButton(currentUser, user.id),
            );
        }
        // chatHolder.appendChild(createPrivateChatButton(currentUser, user.id));
        element.appendChild(chatHolder);
        // element.appendChild(createPrivateChatButton(currentUser, user.id));
        name.appendChild(username);
        name.appendChild(status);

        return element;
    }
    return null;
}
