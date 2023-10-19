function createPrivateChatButton(senderId, receiverId) {
    // Create the form element
    const form = document.createElement('form');
    form.action = '/privateChat/' + senderId + '/' + receiverId;
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
    return new Promise((resolve, reject) => {
        $.ajax('/users/current', {
            method: 'GET',
            datatype: 'json',
            success: (response) => {
                resolve(response.userId);
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
    getCurrentUserId().then((currentId) => {
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
                            //console.log("username is " + user.username);
                            //console.log("current status is " + user.current_status);
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
                            element.appendChild(name);
                            element.appendChild(status);
                            // only show chat button next to other users
                            if (currentId != user.id) {
                                let button = createPrivateChatButton(
                                    currentId,
                                    user.id,
                                );
                                element.appendChild(button);
                            }
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
});
