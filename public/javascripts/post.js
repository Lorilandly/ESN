/* global socket getCurrentUser bootstrap */

$(document).ready(() => {
    document.getElementById('search-bar').remove();
    const backButton = document.createElement('form');
    backButton.action = '/lostAndFounds';
    backButton.className = 'back-button';
    backButton.method = 'GET';
    backButton.innerHTML = `
        <button class="bi bi-arrow-left-short"></button>
    `;
    document.getElementsByClassName('header')[0].appendChild(backButton);
    getPostInformation();

    socket.on('create new reply', ({ postID }) => {
        const thisPostID = parseInt(getPostID());
        if (postID === thisPostID) {
            refreshPost();
        }
    });
});

function getPostID() {
    const url = window.location.href;
    const urlSplit = url.split('/');
    const postid = parseInt(urlSplit[urlSplit.length - 1]);
    return postid;
}

function getPostInformation() {
    const postID = getPostID();
    $.ajax('/lostAndFounds/posts/' + postID + '/info', {
        method: 'GET',
        datatype: 'json',
        success: (data) => {
            const postInfo = data.post;
            const replies = data.replies;
            updatePostInfo(postInfo[0]);
            updateReplies(replies);
        },
        error: (error) => {
            console.error('API Error:', error);
        },
    });
}

function updatePostInfo(postInfo) {
    document.getElementsByClassName('header-text')[0].innerHTML = postInfo.title;

    const postDiv = document.getElementsByClassName('post')[0];
    postDiv.id = postInfo.id;
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-sender">
                ${postInfo.sender_name}
            </span>
            <span class="post-time">
                ${postInfo.time}
            </span>
        </div>
        <div class="post-body">
            <span class="post-body-content">
                ${postInfo.body}
            </span>
        </div>
        <button class="post-reply-btn" id="${postInfo.id}" data-bs-toggle="modal" data-bs-target="#postReplyModal">
            Reply
        </button>
    `;
}

function updateReplies(replies) {
    replies.forEach(reply => {
        const replyDiv = document.createElement('div');
        let replySender = '';
        replyDiv.className = 'reply';
        const replyInfo = JSON.stringify({ replyID: reply.id, senderName: reply.sender_name });
        if (reply.replyee_name === 'No replyee') {
            replySender = reply.sender_name;
        } else {
            replySender = reply.sender_name + ' -> ' + reply.replyee_name;
        }
        replyDiv.innerHTML = `
            <span class="reply-sender">
                ${replySender}
            </span>
            <span class="reply-body">
                : ${reply.body}
            </span>
            <div class="reply-misc">
                <span class="reply-time">
                    ${reply.time}
                </span>
                <button class="reply-btn" id="${reply.id}" data-bs-toggle="modal" data-bs-target="#replyReplyModal" onclick=changeReplyInfo(${replyInfo})>
                    Reply
                </button>
            </div>
        `;
        document.getElementById('reply-container').appendChild(replyDiv);
    });
}

async function createPostReply() {
    const postID = getPostID();
    const replyBody = document.getElementById('post-reply-textarea');
    const replyID = 0;
    const senderID = (await getCurrentUser()).id;
    // if replyBody is empty, return
    if (replyBody.value.length === 0) {
        alert('Reply message cannot be empty');
        return;
    }

    $.ajax({
        url: '/lostAndFounds/posts/' + postID + '/response',
        method: 'POST',
        data: {
            postID,
            replyID,
            senderID,
            body: replyBody.value,
        },
        dataType: 'json',
        error: (error) => {
            console.error('API Error:', error);
        },
    });

    // clear reply body
    replyBody.value = '';
    // close modal
    const modalElement = document.getElementById('postReplyModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
}

function changeReplyInfo(replyInfo) {
    const replyReplyModal = document.getElementById('replyReplyModal');
    replyReplyModal.getElementsByClassName('modal-title')[0].innerHTML = 'Reply to ' + replyInfo.senderName;
    const replyReplyModalButton = replyReplyModal.getElementsByClassName('btn btn-dark')[0];
    replyReplyModalButton.id = replyInfo.replyID;
}

async function createReplyReply(replyID) {
    const postID = getPostID();
    const replyBody = document.getElementById('reply-reply-textarea');
    const senderID = (await getCurrentUser()).id;
    // if replyBody is empty, return
    if (replyBody.value.length === 0) {
        alert('Reply message cannot be empty');
        return;
    }
    $.ajax({
        url: '/lostAndFounds/posts/' + postID + '/response',
        method: 'POST',
        data: {
            postID,
            replyID,
            senderID,
            body: replyBody.value,
        },
        dataType: 'json',
        error: (error) => {
            console.error('API Error:', error);
        },
    });

    // clear reply body
    replyBody.value = '';

    // close modal
    const modalElement = document.getElementById('replyReplyModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
}

function refreshPost() {
    // clear post container
    document.getElementsByClassName('post')[0].innerHTML = '';
    // clear reply container
    document.getElementById('reply-container').innerHTML = '';
    // refresh replies
    getPostInformation();
}
