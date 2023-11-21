$(document).ready(async () => {
    document.getElementById('search-bar').remove();
    $('#username').text((await window.user).username);
});

async function updateProfile(e) { // eslint-disable-line no-unused-vars
    e.preventDefault();
    e.stopPropagation();
    $('#profileSubmit')
        .prop('disabled', true)
        .append('<span class="spinner-border spinner-border-sm"></span>');
    const reqObj = {};
    const profileForm = document.forms.profileForm;
    for (let i = 0; i < profileForm.length; i++) {
        const ele = profileForm[i];
        if (ele.tagName === 'BUTTON') {
            continue;
        }
        reqObj[ele.id] = ele.value;
    }

    $.ajax({
        url: '/users/profile',
        method: 'PUT',
        data: reqObj,
        dataType: 'json',
        success: () => {
            location.reload();
        },
        error: (err) => {
            console.error('Profile update error', err);
        },
    });
    return false;
}
