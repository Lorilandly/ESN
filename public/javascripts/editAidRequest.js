function getAidRequestIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return parseInt(pathSegments[3]);
}

function createSaveButton(aidRequestId) {
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save My Edits';
    saveButton.className = 'post-button';
    saveButton.setAttribute('type', 'submit');

    const form = document.getElementById('edit-aid-request-form');
    form.appendChild(saveButton);
    return form;
}

$(document).ready(() => {
    const aidRequestId = getAidRequestIdFromPath();

    $.ajax('/aidRequests/all/' + aidRequestId, {
        method: 'GET',
        // data: {
        //     aidRequestId: aidRequestId
        // },
        dataType: 'json',
        success: async (res) => {
            const aidRequest = res.aidRequest;
            console.log(aidRequest);
            // get and display aid request detail
            document.getElementById('title').value = aidRequest.title;
            document.getElementById('description').value = aidRequest.description;
            document.getElementById('priority').value = aidRequest.priority;

            const saveButton = createSaveButton(aidRequestId);
            document.getElementById('edit-aid-request-page-body').appendChild(saveButton);

        },
        error: (error) => {
            console.error('API Error:', error);
        },
    });


    // edit aid request
    $('#edit-aid-request-form').submit(async (event) => {
        event.preventDefault();

        const title = $('#title').val();
        const description = $('#description').val();
        const priority = $('#priority').val();

        console.log(priority);

        $.ajax('/aidRequests/' + aidRequestId, {
            method: 'PUT',
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
