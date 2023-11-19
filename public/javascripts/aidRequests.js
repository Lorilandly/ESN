function getAidRequestPageTypeFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[2];
}

const pageType = getAidRequestPageTypeFromPath();

function showSection(aidRequestPageType) {
    switch (aidRequestPageType) {
        case 'all':
            showAllAidRequests();
            break;
        case 'submitted':
            showSubmittedAidRequests();
            break;
        case 'accepted':
            showAcceptedAidRequests();
            break;
    }
}

function createCreateButton() {
    const createButton = document.createElement('button');
    createButton.textContent = 'Create Aid Request';
    createButton.className = 'post-button';

    createButton.addEventListener('click', function () {
        window.location.href = '/aidRequestsPage/new';
    });
    return createButton;
}

function createViewButton(aidRequestId) {
    const viewButton = document.createElement('button');
    viewButton.setAttribute('class', 'icon-button');

    const viewIcon = document.createElement('i');
    viewIcon.setAttribute('class', 'bi bi-info-circle');
    viewButton.appendChild(viewIcon);

    viewButton.addEventListener('click', function () {
        window.location.href = '/aidRequestsPage/detail/' + aidRequestId;;
    });
    return viewButton;
}

function createEditButton(aidRequestId) {
    const editButton = document.createElement('button');
    editButton.setAttribute('class', 'icon-button');

    const editIcon = document.createElement('i');
    editIcon.setAttribute('class', 'bi bi-pencil');
    editButton.appendChild(editIcon);

    editButton.addEventListener('click', function () {
        // console.log(aidRequestId);
        window.location.href = '/aidRequestsPage/edit/' + aidRequestId;
    });
    return editButton;
}

function createCancelButton(aidRequestId) {
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel Aid Request';
    cancelButton.setAttribute('class', 'cancel-button');

    cancelButton.addEventListener('click', function () {
        $.ajax('/aidRequests/', {
            method: 'DELETE',
            data: {
                aidRequestId: aidRequestId
            },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });

        window.location.href = '/aidRequestsPage/submitted';
    });
    return cancelButton;
}

function createResolveButton(aidRequestId) {
    const resolveButton = document.createElement('button');
    resolveButton.setAttribute('class', 'icon-button');
    resolveButton.addEventListener('click', function () {
        $.ajax('/aidRequests/resolved', {
            method: 'POST',
            data: {
                aidRequestId: aidRequestId
            },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });

        window.location.href = '/aidRequestsPage/submitted';
    });

    const checkIcon = document.createElement('i');
    checkIcon.setAttribute('class', 'bi bi-check-lg');
    resolveButton.appendChild(checkIcon);

    return resolveButton;
}

function showAllAidRequests() {
    $.ajax('/aidRequests/all', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const aidRequests = res.aidRequests;
            const aidRequestPageContainer = document.getElementById(
                'aid-request-page-container',
            );
            // Clear previous content
            aidRequestPageContainer.innerHTML = '';
            if (aidRequests && aidRequests.length > 0) {
                aidRequests.forEach((aidRequest) => {
                    const aidRequestElement = document.createElement('div');
                    aidRequestElement.className = 'aid-request';

                    const creatorSpan = document.createElement('span');
                    creatorSpan.className = 'aid-request-creator';
                    creatorSpan.textContent = aidRequest.creatorName;
                    aidRequestElement.appendChild(creatorSpan);

                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'aid-request-title';
                    titleSpan.textContent = aidRequest.title;
                    aidRequestElement.appendChild(titleSpan);

                    const prioritySpan = document.createElement('span');
                    prioritySpan.className = 'aid-request-priority';
                    prioritySpan.textContent = aidRequest.priority;
                    aidRequestElement.appendChild(prioritySpan);

                    const statusSpan = document.createElement('span');
                    statusSpan.className = 'aid-request-status';
                    statusSpan.textContent = aidRequest.status === 'ACCEPTED' ? 'Y' : 'N';
                    aidRequestElement.appendChild(statusSpan);

                    aidRequestElement.appendChild(createViewButton(aidRequest.id));

                    aidRequestPageContainer.appendChild(aidRequestElement);
                });
            }
            aidRequestPageContainer.appendChild(createCreateButton());
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function showSubmittedAidRequests() {
    $.ajax('/aidRequests/submitted', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const aidRequests = res.aidRequests;
            console.log(aidRequests);
            if (aidRequests && aidRequests.length > 0) {
                const aidRequestPageContainer = document.getElementById('aid-request-page-container');
                // Clear previous content
                aidRequestPageContainer.innerHTML = '';

                aidRequests.forEach((aidRequest) => {
                    const aidRequestElement = document.createElement('div');
                    aidRequestElement.className = 'aid-request';

                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'aid-request-title';
                    titleSpan.textContent = aidRequest.title;
                    aidRequestElement.appendChild(titleSpan);

                    const prioritySpan = document.createElement('span');
                    prioritySpan.className = 'aid-request-priority';
                    prioritySpan.textContent = aidRequest.priority;
                    aidRequestElement.appendChild(prioritySpan);

                    const statusSpan = document.createElement('span');
                    statusSpan.className = 'aid-request-status';
                    statusSpan.textContent = aidRequest.status === 'ACCEPTED' ? 'Y' : 'N';
                    aidRequestElement.appendChild(statusSpan);

                    aidRequestElement.appendChild(createEditButton(aidRequest.id));
                    if (aidRequest.status === 'ACCEPTED') {
                        aidRequestElement.appendChild(createResolveButton(aidRequest.id));
                    }
                    aidRequestPageContainer.appendChild(aidRequestElement);
                });
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function showAcceptedAidRequests() {
    $.ajax('/aidRequests/accepted', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const aidRequests = res.aidRequests;
            if (aidRequests && aidRequests.length > 0) {
                const aidRequestPageContainer = document.getElementById('aid-request-page-container');
                // Clear previous content
                aidRequestPageContainer.innerHTML = '';

                aidRequests.forEach((aidRequest) => {
                    const aidRequestElement = document.createElement('div');
                    aidRequestElement.className = 'aid-request';

                    const creatorSpan = document.createElement('span');
                    creatorSpan.className = 'aid-request-creator';
                    creatorSpan.textContent = aidRequest.creatorName;
                    aidRequestElement.appendChild(creatorSpan);

                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'aid-request-title';
                    titleSpan.textContent = aidRequest.title;
                    aidRequestElement.appendChild(titleSpan);

                    const prioritySpan = document.createElement('span');
                    prioritySpan.className = 'aid-request-priority';
                    prioritySpan.textContent = aidRequest.priority;
                    aidRequestElement.appendChild(prioritySpan);

                    const statusSpan = document.createElement('span');
                    statusSpan.className = 'aid-request-status';
                    statusSpan.textContent = aidRequest.status === 'ACCEPTED' ? 'Y' : 'N';
                    aidRequestElement.appendChild(statusSpan);

                    aidRequestElement.appendChild(createViewButton(aidRequest.id));

                    aidRequestPageContainer.appendChild(aidRequestElement);
                });
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

$(document).ready(() => {
    // show aid requests based on different page type
    const aidRequestPageType = getAidRequestPageTypeFromPath();
    showSection(aidRequestPageType);

    // create aid request
    $('#create-aid-request-form').submit(async (event) => {
        event.preventDefault();

        const title = $('#title').val();
        const description = $('#description').val();
        const priority = $('#priority').val();

        $.ajax('/aidRequests/', {
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

    // edit aid request
    $('#edit-aid-request-form').submit(async (event) => {
        event.preventDefault();

        const title = $('#title').val();
        const description = $('#description').val();
        const priority = $('#priority').val();

        $.ajax('/aidRequests', {
            method: 'PUT',
            data: {
                title: title,
                description: description,
                priority: priority,
                aidRequestId: aidRequestId,
            },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });

        window.location.href = '/aidRequestsPage/submitted';
    });

});
