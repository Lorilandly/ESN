/* global modifyHeader */

function getAidRequestPageTypeFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[2];
}

const dropDownMenu = document.getElementById('aid-request-category-menu');
const selectedSectionText = document.getElementById('dropdown-selected');

function toggleDropDown() {
    const dropDownIcon = document.getElementById('dropdown-icon');
    const isOpen = dropDownMenu.classList.contains('dropdown-open');
    if (isOpen) {
        dropDownMenu.classList.add('dropdown-close');
        dropDownMenu.classList.remove('dropdown-open');
    } else {
        dropDownMenu.classList.add('dropdown-open');
        dropDownMenu.classList.remove('dropdown-close');
    }
    dropDownIcon.classList.toggle('bi-caret-right');
}

function showSectionAndToggle(aidRequestPageType, item) {
    toggleDropDown();
    showSection(aidRequestPageType, item);
}

function showSection(aidRequestPageType, item) {
    const items = document.querySelectorAll('#aid-request-category-menu a');
    items.forEach((a) => {
        a.classList.remove('selected');
    });

    item.classList.add('selected');

    switch (aidRequestPageType) {
        case 'all':
            selectedSectionText.innerText = 'All Aid Requests';
            showAllAidRequests();
            break;
        case 'submitted':
            selectedSectionText.innerText = 'Submitted Aid Requests';
            showSubmittedAidRequests();
            break;
        case 'accepted':
            selectedSectionText.innerText = 'Accepted Aid Requests';
            showAcceptedAidRequests();
            break;
    }
}

function createCreateButton() {
    const createButtonContainer = document.createElement('div');
    createButtonContainer.className = 'post-button-container';

    const createButton = document.createElement('button');
    createButton.textContent = 'Create Aid Request';
    createButton.className = 'post-button';

    createButtonContainer.appendChild(createButton);

    createButton.addEventListener('click', function () {
        window.location.href = '/aidRequestsPage/new';
    });
    return createButtonContainer;
}

function createViewButton(aidRequestId) {
    const viewButton = document.createElement('button');
    viewButton.setAttribute('class', 'icon-button');

    const viewIcon = document.createElement('i');
    viewIcon.setAttribute('class', 'bi bi-info-circle');
    viewButton.appendChild(viewIcon);

    viewButton.addEventListener('click', function () {
        window.location.href = '/aidRequestsPage/detail/' + aidRequestId;
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
        window.location.href = '/aidRequestsPage/edit/' + aidRequestId;
    });
    return editButton;
}

function createResolveButton(aidRequestId) {
    const resolveButton = document.createElement('button');
    resolveButton.setAttribute('class', 'icon-button');
    resolveButton.addEventListener('click', function () {
        $.ajax('/aidRequests/resolved/' + aidRequestId, {
            method: 'PUT',
            data: {
                aidRequestId,
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

function showTableHeader(titles) {
    const aidRequestTable = document.createElement('table');
    aidRequestTable.id = 'aid-request-table';
    const aidRequestTableHeaderRow = document.createElement('tr');
    titles.forEach((title) => {
        const aidRequestTableHeaderTitle = document.createElement('th');
        aidRequestTableHeaderTitle.innerText = title;
        aidRequestTableHeaderRow.appendChild(aidRequestTableHeaderTitle);
    });

    aidRequestTable.appendChild(aidRequestTableHeaderRow);

    return aidRequestTable;
}

function showCommonColumns(aidRequestItem, aidRequest) {
    const titleSpan = document.createElement('td');
    titleSpan.className = 'aid-request-title';
    titleSpan.textContent = aidRequest.title;
    aidRequestItem.appendChild(titleSpan);

    const prioritySpan = document.createElement('td');
    prioritySpan.className = 'aid-request-priority';
    prioritySpan.textContent = aidRequest.priority;
    aidRequestItem.appendChild(prioritySpan);

    const statusSpan = document.createElement('td');
    statusSpan.className = 'aid-request-status';
    statusSpan.textContent = aidRequest.status === 'ACCEPTED' ? 'Y' : 'N';
    aidRequestItem.appendChild(statusSpan);
}

function showAidRequestsBody(res, aidRequestTable) {
    const aidRequests = res.aidRequests;
    const aidRequestPageContainer = document.getElementById(
        'aid-request-page-list',
    );
    // Clear previous content
    aidRequestPageContainer.innerHTML = '';
    if (aidRequests && aidRequests.length > 0) {
        aidRequests.forEach((aidRequest) => {
            const aidRequestItem = document.createElement('tr');
            aidRequestItem.className = 'aid-request-item';

            const creatorSpan = document.createElement('td');
            creatorSpan.className = 'aid-request-creator';
            creatorSpan.textContent = aidRequest.creatorName;
            aidRequestItem.appendChild(creatorSpan);

            showCommonColumns(aidRequestItem, aidRequest);

            const buttonSpan = document.createElement('td');
            buttonSpan.className = 'aid-request-action';
            buttonSpan.appendChild(createViewButton(aidRequest.id));
            aidRequestItem.appendChild(buttonSpan);

            aidRequestTable.appendChild(aidRequestItem);
        });
    }
    aidRequestPageContainer.appendChild(aidRequestTable);
    aidRequestPageContainer.appendChild(createCreateButton());
}

function showAllAidRequests() {
    const aidRequestTable = showTableHeader([
        'Name',
        'Title',
        'Priority',
        'Accepted',
        'View',
    ]);

    $.ajax('/aidRequests/all', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            showAidRequestsBody(res, aidRequestTable);
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function showSubmittedAidRequests() {
    const aidRequestTable = showTableHeader([
        'Title',
        'Priority',
        'Accepted',
        'Edit',
        'Resolve',
    ]);

    $.ajax('/aidRequests/submitted', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            const aidRequests = res.aidRequests;
            if (aidRequests && aidRequests.length > 0) {
                const aidRequestPageContainer = document.getElementById(
                    'aid-request-page-list',
                );
                // Clear previous content
                aidRequestPageContainer.innerHTML = '';

                aidRequests.forEach((aidRequest) => {
                    const aidRequestItem = document.createElement('tr');
                    aidRequestItem.className = 'aid-request-item';

                    showCommonColumns(aidRequestItem, aidRequest);

                    const editSpan = document.createElement('td');
                    editSpan.className = 'aid-request-edit';
                    editSpan.appendChild(createEditButton(aidRequest.id));
                    aidRequestItem.appendChild(editSpan);

                    const resolveSpan = document.createElement('td');
                    resolveSpan.className = 'aid-request-resolve';
                    if (aidRequest.status === 'ACCEPTED') {
                        resolveSpan.appendChild(
                            createResolveButton(aidRequest.id),
                        );
                    }
                    aidRequestItem.appendChild(resolveSpan);
                    aidRequestTable.appendChild(aidRequestItem);
                });

                aidRequestPageContainer.appendChild(aidRequestTable);
            }
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function showAcceptedAidRequests() {
    const aidRequestTable = showTableHeader([
        'Name',
        'Title',
        'Priority',
        'Accepted',
        'View',
    ]);

    $.ajax('/aidRequests/accepted', {
        method: 'GET',
        datatype: 'json',
        success: async (res) => {
            showAidRequestsBody(res, aidRequestTable);
        },
        error: (res) => {
            console.error('Error:', res);
        },
    });
}

function getDropdownItemFromPageType(pageType) {
    switch (pageType) {
        case 'all':
            return document.getElementById('all');
        case 'submitted':
            return document.getElementById('submitted');
        case 'accepted':
            return document.getElementById('accepted');
    }
}

$(document).ready(() => {
    modifyHeader(false, 'Aid Requests');
    // show aid requests based on different page type
    const aidRequestPageType = getAidRequestPageTypeFromPath();
    const dropdownItem = getDropdownItemFromPageType(aidRequestPageType);
    showSection(aidRequestPageType, dropdownItem);

    // create aid request
    $('#create-aid-request-form').submit(async (event) => {
        event.preventDefault();

        const title = $('#title').val();
        const description = $('#description').val();
        const priority = $('#priority').val();

        $.ajax('/aidRequests/', {
            method: 'POST',
            data: {
                title,
                description,
                priority,
            },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });

        window.location.href = '/aidRequestsPage/submitted';
    });
});
