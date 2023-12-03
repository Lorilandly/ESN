/* global socket modifyHeader */

function constructBaseFloodReport() {
    const floodReport = document.createElement('div');
    floodReport.className = 'message';
    floodReport.style.position = 'relative';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-flood-report-button';

    const cancelIcon = document.createElement('i');
    cancelIcon.className = 'bi bi-x-circle';
    cancelIcon.style.color = 'red';
    cancelButton.appendChild(cancelIcon);

    const updateButton = document.createElement('button');
    updateButton.className = 'update-flood-report-button';

    const updateIcon = document.createElement('i');
    updateIcon.className = 'bi bi-pencil-square';
    updateButton.appendChild(updateIcon);

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
    floodReport.append(updateButton);
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

function registerUpdateHandler(button, floodReportID) {
    button.addEventListener('click', function () {
        updateFloodReport(floodReportID);
    });
}

const baseFloodReport = constructBaseFloodReport();

function formatLocation(address, city, state, zipcode) {
    return address + '<br>' + city + ', ' + state + ' ' + zipcode;
}

function createFloodReport(floodReport) {
    const timestamp = floodReport.time;
    const address = formatLocation(
        floodReport.address,
        floodReport.city,
        floodReport.state,
        floodReport.zipcode,
    );
    const description = floodReport.description;

    const newFloodReport = baseFloodReport.cloneNode(true);
    newFloodReport.setAttribute('flood-report-id', floodReport.id);
    newFloodReport.querySelector('.time-reported-body').textContent = timestamp;
    newFloodReport.querySelector('.location-body').innerHTML = address;
    newFloodReport.querySelector('.description-body').textContent = description;

    registerCancelHandler(
        newFloodReport.querySelector('.cancel-flood-report-button'),
        address,
        floodReport.id,
    );
    registerUpdateHandler(
        newFloodReport.querySelector('.update-flood-report-button'),
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

function updateFloodReport(floodReportID) {
    window.location.href = '/floodNotices/update/' + floodReportID;
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
    modifyHeader(false, 'Flood Reports');
    document.getElementById('flood-reports-button').classList.add('text-primary');
    displayAllFloodReports();
    socket.on('create-flood-report', (floodReport) => {
        $('#flood-reports-container').append(createFloodReport(floodReport));
        $('#flood-reports-container').scrollTop(
            $('#flood-reports-container')[0].scrollHeight,
        );
    });
    socket.on('delete-flood-report', (floodReportID) => {
        const query = `[flood-report-id="${floodReportID}"]`;
        const element = $(query);
        if (element.length > 0) {
            element.remove();
        }
        $('#flood-reports-container').scrollTop(
            $('#flood-reports-container')[0].scrollHeight,
        );
    });
    socket.on('updated-flood-report', (floodReport) => {
        const query = `[flood-report-id="${floodReport.id}"]`;
        const element = $(query);
        if (element.length > 0) {
            element
                .find('.location-body')
                .html(
                    formatLocation(
                        floodReport.address,
                        floodReport.city,
                        floodReport.state,
                        floodReport.zipcode,
                    ),
                );
            element.find('.description-body').text(floodReport.description);
        }
        $('#flood-reports-container').scrollTop(
            $('#flood-reports-container')[0].scrollHeight,
        );
    });
});
