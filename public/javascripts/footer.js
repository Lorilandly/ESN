/* global getCurrentUser */

$(document).ready(async function () {
    // find the offcanvas-username element
    const username = document.getElementById('offcanvas-username');
    // set the username to the username element
    const currentUser = await getCurrentUser();
    username.innerHTML = currentUser.username;
});
