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
                        let username = document.createElement('span');
                        username.className =
                            'user-list-body-element-name-username';
                        username.innerHTML = user.username;
                        let status = document.createElement('span');
                        switch (user.status) {
                            case 'OK':
                                status.innerHTML += ' - 🟢';
                                break;
                            case 'HELP':
                                status.innerHTML += ' - 🟡';
                                break;
                            case 'EMERGENCY':
                                status.innerHTML += ' - 🔴';
                                break;
                            default:
                                status.innerHTML += '';
                                break;
                        }
                        let loginStatus = document.createElement('div');
                        if (user.current_status == 'ONLINE') {
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
                        name.appendChild(username);
                        name.appendChild(status);
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
