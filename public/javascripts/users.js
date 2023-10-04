$(document).ready(() => {
    // Capture form submission event
    $.ajax('/users', {
        method: 'GET',
        datatype: 'json',
        statusCode: {
            200: (res) => {
                let listbody = document.getElementById('user-list-body');
                for (let i in res) {
                    let user = res[i];
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
                    status.innerHTML = user.current_status;
                    element.appendChild(name);
                    element.appendChild(status);
                    listbody.appendChild(element);
                }
            },
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
});
