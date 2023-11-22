function createSubmitButton() {
    const form = document.getElementById('create-aid-request-form');
    form.method = 'post';
    form.action = '/aidRequests';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Aid Request';
    submitButton.className = 'post-button';
    submitButton.setAttribute('type', 'submit');

    form.appendChild(submitButton);

    return form;
}

$(document).ready(() => {
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
                title: title,
                description: description,
                priority: priority,
            },
            dataType: 'json',
            success: (_) => {
                window.location.href = '/aidRequestsPage/submitted';
            },
            error: (res) => {
                console.log(res.responseJSON.error);
                if (res.responseJSON.error === 'Invalid title') {
                    $('#alert-msg span').text(
                        'Title length must be between 3 and 10',
                    );
                    $('#title').val('');
                } else {
                    console.error('API Error:', error);
                }
            },
        });
    });
});
