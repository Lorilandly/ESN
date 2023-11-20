function createFloodReport(floodReport) {
    const newFloodReport = document.createElement('div');
    newFloodReport.setAttribute('class', 'flood-report');

    // create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-flood-report-button';
    console.log(`setting flood-report-id: ${floodReport.id}`);
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
        '\n' +
        floodReport.state +
        '\t' +
        floodReport.zipcode;
    const description = floodReport.description;

    const timestampBody = document.createElement('p');
    timestampBody.textContent = timestamp;

    const addressBody = document.createElement('p');
    addressBody.textContent = address;

    const descriptionBody = document.createElement('p');
    descriptionBody.textContent = description;

    newFloodReport.append(cancelButton);
    newFloodReport.append(timestampHeader);
    newFloodReport.append(timestampBody);
    newFloodReport.append(addressHeader);
    newFloodReport.append(addressBody);
    newFloodReport.append(descriptionHeader);
    newFloodReport.append(descriptionBody);

    return newFloodReport;
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
            const floodReportsList = document.getElementById(
                'flood-reports-container',
            );

            for (const i in floodReports) {
                floodReportsList.append(createFloodReport(floodReports[i]));
                // floodReportsList.scrollTop(floodReportsList[0].scrollHeight);
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
