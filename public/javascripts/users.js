function createPrivateChatButton(senderId, receiverId) {
    // Create the form element
    const form = document.createElement('form');
    form.action = '/privateChatWindow/' + senderId + "/" + receiverId;
    form.method = 'get';

    // Create the button inside the form
    const chatButton = document.createElement('button');
    chatButton.type = 'submit';
    chatButton.innerText = 'Start Chat';

    // Append the button to the form
    form.appendChild(chatButton);
    return form;
}

function getCurrentUserId() {
    return $.ajax('/users/current', {
        method: 'GET',
        datatype: 'json'
    });
}

$(document).ready(() => {
    // Capture form submission event
    $('#logout-form').submit((event) => {
        event.preventDefault(); // Prevent the default form submission
        $.ajax('/users/logout', {
            method: 'PUT',
            datatype: 'json',
            success: () => {
                location.href = '/';
            },
            error: (_) => {
                console.error('Login error:', res);
            },
        });
    });

    // Get user list from API
    $.ajax('/users', {
        method: 'GET',
        datatype: 'json',
        statusCode: {
            200: (res) => {
                let listbody = document.getElementById('user-list-body');
                for (let i in res) {
                    let user = res[i];
                    let user_id = document.getElementById(
                        `user-status-${user.username}`,
                    );
                    if (!user_id) {
                        let element = document.createElement('div');
                        element.className = 'user-list-body-element';
                        let name = document.createElement('div');
                        name.className = 'user-list-body-element-name';
                        name.innerHTML = user.username;
                        let status = document.createElement('div');
                        if (user.current_status == 'ONLINE') {
                            status.className =
                                'user-list-body-element-status-online';
                        } else {
                            status.className =
                                'user-list-body-element-status-offline';
                        }
                        status.id = `user-status-${user.username}`;
                        status.innerHTML = user.current_status;
                        // add private chat button
                        // button/form
                        let button = createPrivateChatButton(getCurrentUserId(), user.id);
                        element.appendChild(name);
                        element.appendChild(status);
                        element.appendChild(button);
                        listbody.appendChild(element);
                    }
                }
            },
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
});
