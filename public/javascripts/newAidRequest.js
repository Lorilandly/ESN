function createSubmitButton(aidRequestId) {
    const form = document.createElement('form');
    form.id = 'create-aid-request-form';
    form.method = 'put';
    form.action = '/aidRequests/' + aidRequestId;

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Save My Edits';
    submitButton.className = 'post-button';
    submitButton.setAttribute('type', 'submit');

    form.appendChild(submitButton);

    return form;
}

$(document).ready(() => {
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
            error: (error) => {
                console.error('API Error:', error);
            },
        });

        window.location.href = '/aidRequestsPage/submitted';
    });

});