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

$(document).ready(async function () {
    // find the offcanvas-username element
    const username = document.getElementById('offcanvas-username');
    // set the username to the username element
    const currentUser = await getCurrentUser();
    username.innerHTML = currentUser.username;
});
