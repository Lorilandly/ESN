function getAidRequestIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return parseInt(pathSegments[3]);
}

function createAcceptButton(aidRequestId) {
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept Aid Request';
    acceptButton.className = 'post-button';
    acceptButton.setAttribute('type', 'submit');

    acceptButton.addEventListener('click', function () {
        $.ajax('/aidRequests/accepted/' + aidRequestId, {
            method: 'PUT',
            // data: {
            //     aidRequestId: aidRequestId
            // },
            // dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });

        window.location.href = '/aidRequestsPage/accepted';
    });

    return acceptButton;
}

$(document).ready(() => {
    const aidRequestId = getAidRequestIdFromPath();

    $.ajax('/aidRequests/all/' + aidRequestId, {
        method: 'GET',
        // data: {
        //     aidRequestId: aidRequestId
        // },
        // dataType: 'json',
        success: async (res) => {
            const aidRequest = res.aidRequest;
            // get and display aid request detail
            document.getElementById('aid-request-creator').textContent = aidRequest.creatorName;
            document.getElementById('aid-request-title').textContent = aidRequest.title;
            document.getElementById('aid-request-description').textContent = aidRequest.description;
            document.getElementById('aid-request-priority').textContent = aidRequest.priority;

            const currentUser = await getCurrentUser();
            // don't show accept button if it is current user's own aid request
            if (aidRequest.creatorName != currentUser.username) {
                const acceptButton = createAcceptButton(aidRequestId);
                document.getElementById('aid-request-detail-page-body').appendChild(acceptButton);
            }
        },
        error: (error) => {
            console.error('API Error:', error);
        },
    });
});