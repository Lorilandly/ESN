/* global modifyHeader */

function createSubmitButton() {
    const form = document.getElementById('create-aid-request-form');
    form.method = 'post';
    form.action = '/aidRequests';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Aid Request';
    submitButton.className = 'submit-button';
    submitButton.setAttribute('type', 'submit');

    form.appendChild(submitButton);

    return form;
}

$(document).ready(() => {
    modifyHeader(false, 'Aid Request');
    createSubmitButton();
    // create aid request
    $('#create-aid-request-form').submit(async (event) => {
        event.preventDefault();

        const title = $('#title').val();
        const description = $('#description').val();
        const priority = $('#priority').val();

        $.ajax('/aidRequests', {
            method: 'POST',
            data: {
                title,
                description,
                priority,
            },
            dataType: 'json',
            success: (_) => {
                window.location.href = '/aidRequestsPage/submitted';
            },
            error: (res) => {
                if (res.responseJSON.error === 'Invalid title') {
                    $('#alert-msg span').text(
                        'Title must be between 3 and 10 characters',
                    );
                    $('#title').val('');
                } else {
                    console.error('API Error:', res);
                }
            },
        });
    });
});
