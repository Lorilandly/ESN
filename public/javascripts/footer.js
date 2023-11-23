$(document).ready(async function () {
    // Capture form submission event
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
