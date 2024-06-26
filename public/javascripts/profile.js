$(document).ready(async () => {
    document.getElementById('search-bar').remove();
    $('#username').text((await window.user).username);
    $.ajax({
        url: '/users/profile',
        method: 'GET',
        dataType: 'json',
        success: displayEntry,
        error: console.error,
    });
});

function displayEntry(data) {
    if (data.length) {
        $('#profilePlaceholder').hide();
    }
    data.forEach((entry) => {
        if (!entry.key.startsWith('_')) {
            $('#profileEntryList').append(`
                <div class="input-group mb-3">
                    <span class="input-group-text">${entry.key}</span>
                    <input type="text" form="profileForm" class="form-control" id="${entry.key}">
                    <button class="btn btn-danger" type="button" id="deleteButton" onclick="removeEntry(this.parentNode)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `);
        }
        $(`[id='${entry.key}']`).val(entry.val);
    });
}

/* eslint-disable no-unused-vars */
function addEntry(event, form) {
    event.preventDefault();
    event.stopPropagation();
    $(form[0]).removeClass('is-invalid');
    const key = form[0].value.toLowerCase();
    $.ajax({
        url: '/users/profile',
        method: 'POST',
        data: { key },
        dataType: 'json',
        success: () => {
            $('#profilePlaceholder').hide();
            $('#profileEntryList').append(`
                <div class="input-group mb-3">
                    <span class="input-group-text">${key}</span>
                    <input type="text" form="profileForm" class="form-control" id="${key}">
                    <button class="btn btn-danger" type="button" id="deleteButton" onclick="removeEntry(this.parentNode)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `);
        },
        error: (err) => {
            console.error(err);
            $(form[0]).addClass('is-invalid');
        },
    });
    form.reset();
    return false;
}

/* eslint-disable no-unused-vars */
function removeEntry(ele) {
    const inputBox = $(ele).children('input:first');
    const key = inputBox.attr('id');
    $.ajax({
        url: '/users/profile',
        method: 'DELETE',
        data: { key },
        dataType: 'json',
        success: () => {
            $(ele).remove();
            if (!$('#profileEntryList').children().length) {
                $('#profilePlaceholder').show();
            }
        },
        error: (err) => {
            console.error(err);
            inputBox.addClass('is-invalid');
        },
    });
}

/* eslint-disable no-unused-vars */
async function updateProfile(event) {
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
