/* global socket */

$(document).ready(async function () {
    // Capture form submission event
    $('#status-form').submit(async (event) => {
        event.preventDefault();
        const status = $('#status').find(':selected').val();
        $.ajax({
            url: '/users/profile',
            method: 'GET',
            dataType: 'json',
            success: (data) => {
                const emctEmail = data.find((entry) => entry.key === '_emct_email');
                if (emctEmail && emctEmail.val && status === 'EMERGENCY') {
                    $('#helpRequest').modal('show');
                }
            },
            error: console.error,
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        $.ajax({
            url: '/users/status',
            method: 'PUT',
            data: { status },
            dataType: 'json',
            success: () => {
                socket.emit('userStatus', {});
                if (!$('#helpRequest').hasClass('show')) {
                    location.reload();
                }
            },
            error: (err) => {
                console.error('status update somehow error', err);
            },
        });
    });

    $('#logout-form').submit((event) => {
        event.preventDefault();
        $.ajax('/users/logout', {
            method: 'PUT',
            datatype: 'json',
            data: { type: 'logout' },
            success: () => {
                location.href = '/';
            },
            error: (res) => {
                console.error('Login error:', res);
            },
        });
    });

    // find the offcanvas-username element
    const username = document.getElementById('offcanvas-username');
    // set the username to the username element
    const currentUser = await window.user;
    username.innerHTML = currentUser.username;
});

/* eslint-disable no-unused-vars */
function sendHelp(event) {
    event.preventDefault();
    $.ajax({
        url: '/users/profile',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            const emctEmail = data.find((entry) => entry.key === '_emct_email');
            if (emctEmail && emctEmail.val) {
                $.ajax({
                    url: '/users/help',
                    method: 'GET',
                    success: (data) => {
                        location.reload();
                    },
                });
            }
        },
        error: console.error,
    });
}
