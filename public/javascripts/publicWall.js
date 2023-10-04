$(document).ready(() => {
    // Fetch and render all messages
    $.ajax({
        url: '/publicMessages',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            let messages = response.messages;
            if (messages && messages.length > 0) {
                let messageHtml = '';
                messages.forEach((message) => {
                    messageHtml += `
                        <div class="message">
                            <div class="message-title">
                                <span class="message-sender-name">${message.username}</span>
                                <span class="message-time">${message.time}</span>
                                <span class="message-status">${message.status}</span>
                            </div>
                            <div class="message-body">
                                <p>${message.body}</p>
                            </div>
                        </div>`;
                });
                $('#message-container').append(messageHtml);
            }
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });

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
