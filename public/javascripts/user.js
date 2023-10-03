function queryUserApi(dryRun) {
    // Get the message body from the input field
    let username = $('#username').val();
    let password = $('#password').val();

    // Make an AJAX request to user REST API
    $.ajax('/users', {
        method: 'POST',
        data: { username, password, dryRun }, // Pass data to the API
        dataType: 'json', // Specify the response data type
        statusCode: {
            200: (_) => {
                // credencial ok -> show confirm message
                $('#exampleModal').modal('show');
            },
            201: (_) => {
                // user created successfully
                location.href = '/welcome';
            },
        },
        error: (res) => {
            // handled error
            let reason = res.responseJSON.error;
            if (reason == 'User exists') {
                // login with the credential
                console.log('exist');
                $.ajax('/login', {
                    method: 'POST',
                    data: { username, password },
                    dataType: 'json',
                    success: (_) => {
                        console.log('success');
                        location.href = '/';
                    },
                    error: (res) => {
                        console.log(res);
                    },
                });
            }
            $('#alert-msg span').text(reason);
        },
    });
}

$(document).ready(() => {
    // Capture form submission event
    $('#main-form').submit((event) => {
        event.preventDefault(); // Prevent the default form submission
        queryUserApi(true);
    });
    $('#submitsubmit')
        .button()
        .click(() => {
            queryUserApi();
        });
});
