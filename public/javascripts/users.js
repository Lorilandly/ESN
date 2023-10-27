function createPrivateChatButton (senderId, receiverId) {
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

function getCurrentUser () {
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
    // Capture form submission event
    $('#logout-form').submit((event) => {
        event.preventDefault();
        $.ajax('/users/logout', {
            method: 'PUT',
            datatype: 'json',
            success: () => {
                location.href = '/';
            },
            error: (res) => {
                console.error('Login error:', res);
            },
        });
    });

    // Get user list from API
    $.ajax('/users', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const currentUser = await getCurrentUser();
            const listbody = document.getElementById('user-list-body');
            for (const i in res) {
                const user = res[i];
                const userId = document.getElementById(
                    `user-status-${user.username}`,
                );
                if (!userId) {
                    const element = document.createElement('div');
                    element.className = 'user-list-body-element';
                    const name = document.createElement('div');
                    name.className = 'user-list-body-element-name';
                    const username = document.createElement('span');
                    username.className =
                        'user-list-body-element-name-username';
                    username.innerHTML = user.username;
                    const status = document.createElement('i');
                    status.className =
                        'bi bi-circle-fill user-status-' + user.status;
                    const loginStatus = document.createElement('div');
                    const chatHolder = document.createElement('div');
                    chatHolder.className = 'user-list-body-element-chat';

                    if (user.login_status === 'ONLINE') {
                        loginStatus.className =
                            'user-list-body-element-status-online';
                    } else {
                        loginStatus.className =
                            'user-list-body-element-status-offline';
                    }
                    loginStatus.id = `user-status-${user.username}`;
                    loginStatus.innerHTML = user.login_status;

                    element.appendChild(name);
                    element.appendChild(loginStatus);

                    if (user.username !== currentUser.username) {
                        chatHolder.appendChild(createPrivateChatButton(currentUser, user.id));
                    }
                    // chatHolder.appendChild(createPrivateChatButton(currentUser, user.id));
                    element.appendChild(chatHolder);
                    // element.appendChild(createPrivateChatButton(currentUser, user.id));
                    name.appendChild(username);
                    name.appendChild(status);
                    listbody.appendChild(element);
                }
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
});
