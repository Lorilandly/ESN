function queryUserApi(dryRun) {
    // Get the message body from the input field
    const username = $('#username').val();
    const password = $('#password').val();

    // Make request to create new user
    $.ajax('/users', {
        method: 'POST',
        data: { username, password, dryRun }, // API won't create user if `dryRun` is set
        dataType: 'json', // Specify the response data type
        statusCode: {
            200: (_) => {
                // credential ok -> show confirm message
                $('#exampleModal').modal('show');
            },
            201: (_) => {
                // user created successfully
                location.href = '/welcome'; // redirect to welocme page
            },
        },
        error: (res) => {
            // handled error
            const reason = res.responseJSON.error;
            if (reason == 'User exists') {
                // login with the credential
                $.ajax('/users/login', {
                    method: 'PUT',
                    data: { username, password },
                    dataType: 'json',
                    success: (_) => {
                        location.href = '/';
                    },
                    error: (res) => {
                        console.error('Login error:', res);
                    },
                });
            } else {
                $('#alert-msg span').text(reason);
            }
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
