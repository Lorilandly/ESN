function shakeIndicator(){
    const indicator = document.getElementById("notification");
    console.log(indicator);
    indicator.style.animation = "shake 0.1s";
    indicator.style.animationIterationCount = "5";

    indicator.addEventListener('animationend', () => {
        indicator.style.animation = '';
    });
}
function getCurrentUser() {
    return new Promise((resolve, reject) => {
        $.ajax('/users/current', {
            method: 'GET',
            datatype: 'json',
            success: (response) => {
                resolve(response);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

async function changeReadStatus(){
    //
    let receiver_id = await getCurrentUser();
    $.ajax('/messages/private/readStatus', {
        method: 'PUT',
        datatype: 'json',
        data: { receiverId:  receiver_id.id},
        success: () => {},
        error: (error) => {
            console.error(
                'Failed to update messages read status:',
                error,
            );
        },
    });
}

$(document).ready(() => {
    $.ajax({
        url: '/messages/private/new',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            let messages = response.messages;
            console.log(messages);
            if (messages){
                let groupedMessages = {};
                // store reciever id
                let receiverId = messages[0].receiver_id;
                let senderId = messages[0].sender_id;
                $('#receiver_id').text(receiverId);
                // Group messages by sender name
                messages.forEach((message) => {
                    if (!groupedMessages[message.sender_name]) {
                        groupedMessages[message.sender_name] = [];
                    }
                    groupedMessages[message.sender_name].push(message);
                });

                for(let sender in groupedMessages){
                    let messageHtml = '';
                    console.log(sender);
                    groupedMessages[sender].forEach((message) => {
                        messageHtml += `
                        <div class="message">
                            <form class = "message-form" action = '/privateChat/${senderId}' method = 'GET'>
                                <button type="submit" class="btn btn-primary" onclick="clearMessage(this)">
                                    <div class="message-title">
                                        <span class="message-sender-name">${message.sender_name}</span>
                                        <span class="message-time">${message.time}</span>
                                        <span class="message-status">${message.status}</span>
                                    </div>
                                    <div class="message-body">
                                        <span>${message.body}</span>
                                    </div>
                                </button>
                            </form>
                        </div>`;
                    });
                    $('#alert-container').append(messageHtml);
                }
            }
            
        }
    });

    socket.on(
        'create private message',
        async ({ username, time, status, body, userId, receiverId }) => {
            let senderId = userId;
            let user = await getCurrentUser();
            let currentId = user.id;
            // Parsing issue so use == instead of ===, fix later!
            if (currentId == receiverId) {
                shakeIndicator();
                // append message to alert container
                let messageHtml = `
                <div class="message">
                    <form class = "message-form" action = '/privateChat/${senderId}' method = 'GET'>
                        <button type="submit" class="btn btn-primary" onclick="clearMessage(this)">
                            <div class="message-title">
                                <span class="message-sender-name">${username}</span>
                                <span class="message-time">${time}</span>
                                <span class="message-status">${status}</span>
                            </div>
                            <div class="message-body">
                                <span>${body}</span>
                            </div>
                        </button>
                    </form>
                </div>`;
                $('#alert-container').append(messageHtml);
            }
        },
    );

    const offcanvasElement = document.getElementById('offcanvasAlert');

    offcanvasElement.addEventListener('hidden.bs.offcanvas', function (event) {
        // remove all the messages
        $('#alert-container').empty();
        changeReadStatus();
    });

});

function clearMessage(messageButotn){
    changeReadStatus();
}

