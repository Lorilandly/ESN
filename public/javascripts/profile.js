$(document).ready(async () => {
    document.getElementById('search-bar').remove();
    $('#username').text((await window.user).username);
});

function removeEntry(ele) { // eslint-disable-line no-unused-vars
    const inputBox = $(ele).children('input:first');
    const key = inputBox.attr('id');
    $.ajax({
        url: '/users/profile',
        method: 'DELETE',
        data: { key },
        dataType: 'json',
        success: () => {
            $(ele).remove();
        },
        error: (err) => {
            console.error(err);
            inputBox.addClass('is-invalid');
        },
    });
}

async function updateProfile(event) { // eslint-disable-line no-unused-vars
    event.preventDefault();
    event.stopPropagation();
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
