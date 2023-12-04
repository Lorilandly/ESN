$(document).ready(async () => {
    document.getElementsByClassName('header-text')[0].innerHTML = 'All Users';
    // remove search bar
    document.getElementById('search-bar').remove();
    fetchAllUsers();
});

function fetchAllUsers() {
    $.ajax('/users/accounts/all', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const listbody = document.getElementById('user-list-body');
            for (const i in res) {
                const username = res[i].username;

                const userDiv = document.createElement('div');
                userDiv.className = 'user-list-body-element';
                const userNameDiv = document.createElement('div');
                userNameDiv.className = 'user-list-body-element-name';

                const button = document.createElement('div');
                button.type = 'button';
                button.setAttribute('data-bs-toggle', 'modal');
                button.setAttribute('data-bs-target', '#editUserProfileModal');
                button.className = 'user-list-body-element-chat';
                const editButton = document.createElement('i');
                editButton.className = 'bi bi-pencil-square';
                editButton.onclick = () => editUser(res[i]);
                button.appendChild(editButton);

                userNameDiv.innerHTML = username;
                userDiv.appendChild(userNameDiv);
                userDiv.appendChild(button);
                listbody.appendChild(userDiv);
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function editUser(user) {
    $.ajax('/users/' + user.id, {
        method: 'GET',
        datatype: 'json',
        success: (res) => {
            // clear the modal
            document.getElementById('edit-user-name').value = '';
            document.getElementById('edit-user-privilege').value = '';
            document.getElementById('edit-user-acc-status').value = '';
            document.getElementById('edit-user-password').value = '';
            populateEditUserModal(res, user.id);
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function populateEditUserModal(user, userID) {
    document.getElementById('edit-user-name').value = user.username;
    // set the edit-user-privilege select to the user's privilege level
    document.getElementById('edit-user-privilege').value = user.privilegeLevel;
    document.getElementById('edit-user-acc-status').value = user.accountStatus;

    // find the button in the modal and set its onclick function to editUser
    const editUserButton = document.getElementById('edit-user-button');
    editUserButton.onclick = () => updateUserProfile(userID);
}

function updateUserProfile(userID) {
    const profileData = {
        username: document.getElementById('edit-user-name').value,
        accountStatus: document.getElementById('edit-user-acc-status').value,
        privilegeLevel: document.getElementById('edit-user-privilege').value,
    };
    const password = document.getElementById('edit-user-password').value;
    if (password) {
        profileData.password = password;
    }
    $.ajax('/users/' + userID, {
        method: 'PUT',
        datatype: 'json',
        data: profileData,
        success: (res) => {
            // close modal
            $('#editUserProfileModal').modal('hide');
            // refresh the user list
            document.getElementById('user-list-body').innerHTML = '';
            fetchAllUsers();
        },
        error: (res) => {
            // display error message
            alert(res.responseJSON[0]);
        },
    });
}
