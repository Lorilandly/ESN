/* global socket */

let onUnresolvedPage = true;

$(document).ready(async () => {
    const userID = (await getCurrentUser()).id;
    document.getElementById('search-bar').remove();
    const myLostAndFound = document.createElement('div');
    myLostAndFound.className = 'lost-and-found';
    myLostAndFound.id = 'my-lost-and-found';
    myLostAndFound.innerHTML = `
        <button class="lost-and-found-text" onclick="openMyPosts(${userID})" >My Posts</button>
    `;
    document.getElementsByClassName('header')[0].appendChild(myLostAndFound);
    document.getElementsByClassName('header-text')[0].innerHTML =
        'Unresolved Posts';
    getAllUnresolvedPosts();

    socket.on('create new lost and found post', () => {
        if (onUnresolvedPage) {
            refreshPostList();
        } else {
            refreshMyPostList();
        }
    });

    socket.on('resolve lost and found post', ({ userId }) => {
        if (userID != userId && onUnresolvedPage) {
            refreshPostList();
        }
    });
});

function getAllUnresolvedPosts() {
    $.ajax({
        url: '/lostAndFounds/unresolved',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            const posts = response.posts;
            posts.forEach((post) => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                // postDiv.onclick = () => openPost(post.id);
                postDiv.innerHTML = `
                    <div class="post-title">
                        <span class="post-title-text">${post.title}</span> 
                        <form action="/lostAndFounds/posts/${post.id}" method="GET">
                        <button class="bi bi-arrow-right-short" type="submit">
                        </button>
                    </form>
                    </div>
                    <span class="post-time">${post.time}</span>
                    <span class="post-sender">${post.sender_name}</span>
                `;
                document.getElementById('post-container').appendChild(postDiv);
            });
        },
        error: (error) => {
            console.error('Failed to fetch messages:', JSON.stringify(error));
        },
    });
}

async function createPost() {
    const postTitle = document.getElementById('create-post-title');
    // if postTitle is empty, return
    if (postTitle.value.length === 0) {
        alert('Post title cannot be empty');
        return;
    }
    // if postTitle is more than 50 characters, return
    if (postTitle.value.length > 50) {
        alert('Post title must be less than 50 characters');
        return;
    }
    const postBody = document.getElementById('create-post-body');
    // if postBody is empty, return
    if (postBody.value.length === 0) {
        alert('Post message cannot be empty');
        return;
    }
    const userID = (await getCurrentUser()).id;
    $.ajax({
        url: '/lostAndFounds',
        method: 'POST',
        data: {
            userID,
            title: postTitle.value,
            message: postBody.value,
        },
        dataType: 'json',
        error: (error) => {
            console.error('API Error:', error);
        },
    });
    // Clear input fields
    postTitle.value = '';
    postBody.value = '';
    // Close modal
    const modalElement = document.getElementById('createPostModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
}

function openPost(postid) {
    $.ajax({
        url: '/lostAndFounds/posts/' + postid,
        method: 'GET',
        dataType: 'json',
        success: () => {
            window.location.href = '/lostAndFounds/posts/' + postid;
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });
}

function refreshPostList() {
    // Clear post container
    document.getElementById('post-container').innerHTML = '';
    // Refresh messages
    getAllUnresolvedPosts();
}

async function refreshMyPostList() {
    document.getElementById('post-container').innerHTML = '';
    const userID = (await getCurrentUser()).id;
    openMyPosts(userID);
}

async function backToUnresolved() {
    onUnresolvedPage = true;
    const userID = (await getCurrentUser()).id;
    document.getElementsByClassName('header-text')[0].innerHTML =
        'Unresolved Posts';
    // remove my-lost-and-found button
    document.getElementById('lost-and-found').remove();
    const myLostAndFound = document.createElement('div');
    myLostAndFound.className = 'lost-and-found';
    myLostAndFound.id = 'my-lost-and-found';
    myLostAndFound.innerHTML = `
        <button class="lost-and-found-text" onclick="openMyPosts(${userID})" >My Posts</button>
    `;
    document.getElementsByClassName('header')[0].appendChild(myLostAndFound);
    refreshPostList();
}

function openMyPosts(userID) {
    if (onUnresolvedPage) {
        document.getElementById('my-lost-and-found').remove();
        document.getElementsByClassName('header-text')[0].innerHTML =
            'My Posts';
    }
    onUnresolvedPage = false;
    if (!document.getElementById('lost-and-found')) {
        const unresolved = document.createElement('div');
        unresolved.className = 'lost-and-found';
        unresolved.id = 'lost-and-found';
        unresolved.innerHTML = `
            <button class="bi bi-arrow-left" style="color:white" onclick="backToUnresolved()"></button>
        `;
        document.getElementsByClassName('header')[0].appendChild(unresolved);
    }

    $.ajax({
        url: '/lostAndFounds/myPosts',
        method: 'GET',
        dataType: 'json',
        data: {
            userID,
        },
        success(response) {
            document.getElementById('post-container').innerHTML = '';
            const posts = response.posts;
            posts.forEach((post) => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                if (post.resolved) {
                    const resolveDivWrap = document.createElement('div');
                    resolveDivWrap.className = 'resolve-div-wrap';
                    resolveDivWrap.innerHTML = `
                        <button class="resolved" type="button">Resolved</button>
                        <form action="/lostAndFounds/posts/${post.id}" method="GET">
                            <button class="bi bi-arrow-right-short" type="submit">
                        </button>
                    `;
                    postDiv.appendChild(resolveDivWrap);
                } else {
                    const resolveDivWrap = document.createElement('div');
                    resolveDivWrap.className = 'resolve-div-wrap';
                    resolveDivWrap.innerHTML = `
                        <button class="unresolved" type="button" onclick = resolvePost(${post.id}) >Unresolved</button>
                        <form action="/lostAndFounds/posts/${post.id}" method="GET">
                            <button class="bi bi-arrow-right-short" type="submit">
                        </button>
                    `;
                    postDiv.appendChild(resolveDivWrap);
                }
                postDiv.innerHTML += `
                    <div class="post-title">
                        <span class="post-title-text">${post.title}</span>
                    </form>
                    </div>
                    <span class="post-time">${post.time}</span>
                    <span class="post-sender">${post.sender_name}</span>
                `;
                document.getElementById('post-container').appendChild(postDiv);
            });
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });
}

function resolvePost(postid) {
    $.ajax({
        url: '/lostAndFounds/myPosts/status',
        method: 'POST',
        dataType: 'json',
        data: {
            postID: postid,
        },
        success: () => {
            refreshMyPostList();
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    });
}
