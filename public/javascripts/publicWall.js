$(document).ready(function() {
    // Capture form submission event
    $('#messageForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the message body from the input field
        var messageBody = $('#message').val();

        // Make an AJAX request to your REST API
        $.ajax('/publicMessages', {
            method: 'POST',
            data: { message: messageBody }, // Pass data to the API
            dataType: 'json', // Specify the response data type
            success: function(response) {
                // Handle the API response
                var resultDiv = $('#result');
                resultDiv.empty(); // Clear previous results
                resultDiv.append('<p>API Response:</p>');
                resultDiv.append('<pre>' + JSON.stringify(response, null, 2) + '</pre>');
            },
            error: function(error) {
                console.error('API Error:', error);
            }
        });
    });
});
