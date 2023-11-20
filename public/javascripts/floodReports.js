function constructBaseFloodReport() {
    const floodReport = document.createElement('div');
    floodReport.className = 'flood-report';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-flood-report-button';

    const cancelIcon = document.createElement('i');
    cancelIcon.className = 'bi bi-x-circle';
    cancelButton.appendChild(cancelIcon);

    const timestampHeader = document.createElement('h3');
    timestampHeader.className = 'time-reported-header';
    timestampHeader.textContent = 'Time Reported';

    const addressHeader = document.createElement('h3');
    addressHeader.className = 'location-header';
    addressHeader.textContent = 'Location';

    const descriptionHeader = document.createElement('h3');
    descriptionHeader.className = 'description-header';
    descriptionHeader.textContent = 'Description';

    const timestampBody = document.createElement('p');
    timestampBody.className = 'time-reported-body';

    const addressBody = document.createElement('p');
    addressBody.className = 'location-body';

    const descriptionBody = document.createElement('p');
    descriptionBody.className = 'description-body';

    floodReport.append(cancelButton);
    floodReport.append(timestampHeader);
    floodReport.append(timestampBody);
    floodReport.append(addressHeader);
    floodReport.append(addressBody);
    floodReport.append(descriptionHeader);
    floodReport.append(descriptionBody);

    return floodReport;
}

function registerCancelHandler(button, location, floodReportID) {
    button.addEventListener('click', function () {
        const areaSafe = confirm(
            'You are canceling the flood report for:\n\n' +
                location.replace('<br>', '\n') +
                '\n\nIs this area safe?',
        );
        if (areaSafe) {
            deleteFloodReport(floodReportID);
        }
    });
}

const baseFloodReport = constructBaseFloodReport();

function createFloodReport(floodReport) {
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

    const newFloodReport = baseFloodReport.cloneNode(true);
    newFloodReport.querySelector('.time-reported-body').textContent = timestamp;
    newFloodReport.querySelector('.location-body').innerHTML = address;
    newFloodReport.querySelector('.description-body').textContent = description;

    registerCancelHandler(
        newFloodReport.querySelector('.cancel-flood-report-button'),
        address,
        floodReport.id,
    );

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
