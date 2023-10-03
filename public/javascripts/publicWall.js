$(document).ready(() => {
    // Capture form submission event
    $('#messageForm').submit((event) => {
        event.preventDefault(); // Prevent the default form submission

        // Get the message body from the input field
        let messageBody = $('#message').val();

        // Make an AJAX request to publicMessages API
        $.ajax('/publicMessages', {
            method: 'POST',
            data: { message: messageBody }, // Pass data to the API
            dataType: 'json', // Specify the response data type
            success: (response) => {
                // Handle the API response
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
