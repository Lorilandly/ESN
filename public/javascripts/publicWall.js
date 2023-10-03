$(document).ready(() => {
    // Capture form submission event
    $('#messageForm').submit((event) => {
        event.preventDefault();

        // Get the message body from the input field
        let messageBody = $('#message').val();

        // Create message by calling API
        $.ajax('/publicMessages', {
            method: 'POST',
            data: { message: messageBody },
            dataType: 'json', // Specify the response data type
            success: (response) => {
                let resultDiv = $('#result');
                resultDiv.empty(); // Clear previous results
                resultDiv.append('<p>API Response:</p>');
                resultDiv.append(
                    '<pre>' + JSON.stringify(response, null, 2) + '</pre>',
                );
            },
            error: (error) => {
                console.error('API Error:', error);
            },
        });
    });
});
