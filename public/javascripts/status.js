console.log('in status.js!!! on the client side, that is');

var socket = io();

// this particular client is online!
socket.emit('online', {message: "hi"});

// Listen for 'userStatus'
// let me know if someone else's status changes
socket.on('userStatus', (data) => {
    const { username, status } = data;
    console.log("the status for " + username + " is " + status);
    
    // Use a unique ID for each user's status element
    const statusElement = document.getElementById(`user-status-${username}`);
    
    // CREATE NEW ELEMENT
    // if (status == 'ONLINE') {
    //     // create online --> insert into the right spot
    //     const newUserDiv = document.createElement("div");
    //     newUserDiv.setAttribute("class", "user-list-body-element-status-online")
    //     newUserDiv.setAttribute("id", `user-status-${username}`);
    //     document.getElementById("user-list-body-element").innerHTML += newUserDiv
    // } else {
    //     // create offline --> insert into the right spot
    //     const newUserDiv = document.createElement("div");
    //     newUserDiv.setAttribute("class", "user-list-body-element-status-offline");
    //     newUserDiv.setAttribute("id", `user-status-${username}`);
    // }

    // Change the status placeholder to real-time status
    if (statusElement) {
        statusElement.textContent = status;
        if (status === "ONLINE") {
            statusElement.setAttribute("class", "user-list-body-element-status-online");
        } else {
            statusElement.setAttribute("class", "user-list-body-element-status-offline");
        }
    }

    // TODO: reorder elements such that they are 
    // alphabetical by ONLINE then alphabetical by OFFLINE

    // set the change in the HTML
});