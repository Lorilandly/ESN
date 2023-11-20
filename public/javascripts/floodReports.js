function registerCancelHandler(button, location, floodReportID) {
    button.addEventListener('click', function () {
        const areaSafe = confirm(
            'You are canceling the flood report for:\n\n' +
                location +
                '\n\nIs this area safe?',
        );
        if (areaSafe) {
            deleteFloodReport(floodReportID);
        }
    });
}

function createFloodReport(floodReport) {
    const newFloodReport = document.createElement('div');
    newFloodReport.setAttribute('class', 'flood-report');

    // create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-flood-report-button';
    cancelButton.setAttribute('flood-report-id', floodReport.id);

    const cancelIcon = document.createElement('i');
    cancelIcon.className = 'bi bi-x-circle';
    cancelButton.appendChild(cancelIcon);

    // create timestamp header
    const timestampHeader = document.createElement('h3');
    timestampHeader.setAttribute('class', 'time-reported-header');
    timestampHeader.textContent = 'Time Reported';

    // create address header
    const addressHeader = document.createElement('h3');
    addressHeader.setAttribute('class', 'location-header');
    addressHeader.textContent = 'Location';

    // create description header
    const descriptionHeader = document.createElement('h3');
    descriptionHeader.setAttribute('class', 'description-header');
    descriptionHeader.textContent = 'Description';

    const timestamp = floodReport.time;
    const address =
        floodReport.address +
        '<br>' +
        floodReport.city +
        ', ' +
        floodReport.state +
        ' ' +
        floodReport.zipcode;
    const description = floodReport.description;

    const timestampBody = document.createElement('p');
    timestampBody.textContent = timestamp;

    const addressBody = document.createElement('p');
    addressBody.innerHTML = address;

    const descriptionBody = document.createElement('p');
    descriptionBody.textContent = description;

    newFloodReport.append(cancelButton);
    newFloodReport.append(timestampHeader);
    newFloodReport.append(timestampBody);
    newFloodReport.append(addressHeader);
    newFloodReport.append(addressBody);
    newFloodReport.append(descriptionHeader);
    newFloodReport.append(descriptionBody);

    registerCancelHandler(cancelButton, address, floodReport.id);

    return newFloodReport;
}

function deleteFloodReport(floodReportID) {
    $.ajax({
        url: `/floodReports/${floodReportID}`,
        method: 'DELETE',
        success: (_) => {
            window.location.href = '/floodNotices';
        },
        error: (error) => {
            console.error(
                `Failed to delete flood report with id ${floodReportID}`,
                error,
            );
        },
    });
}

function displayAllFloodReports() {
    $.ajax({
        url: '/floodReports',
        method: 'GET',
        dataType: 'json',
        success: (resp) => {
            const floodReports = resp.floodReports;

            if (!floodReports || floodReports.length === 0) {
                return;
            }

            for (const i in floodReports) {
                $('#flood-reports-container').append(
                    createFloodReport(floodReports[i]),
                );
                $('#flood-reports-container').scrollTop(
                    $('#flood-reports-container')[0].scrollHeight,
                );
            }
        },
        error: (error) => {
            console.error('Failed to fetch flood reports: ', error);
        },
    });
}

$(document).ready(() => {
    displayAllFloodReports();
});
