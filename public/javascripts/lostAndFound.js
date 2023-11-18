/* global socket */

$(document).ready(async () => {
    const userID = (await getCurrentUser())["id"];
    document.getElementById('search-bar').remove();
    const myLostAndFound = document.createElement('div');
    myLostAndFound.className = 'my-lost-and-found';
    myLostAndFound.innerHTML = `
        <button class="my-lost-and-found-text" onclick="openMyPosts(${userID})" >My Posts</button>
    `;
    document.getElementsByClassName('header')[0].appendChild(myLostAndFound);
    document.getElementsByClassName('header-text')[0].innerHTML = 'Unresolved Posts';
    getAllUnresolvedPosts();

    socket.on('create new lost and found post', () => {
        refreshPostList();
    })
})

function getAllUnresolvedPosts(){
    $.ajax({
        url: '/lostAndFound/unresolved',
        method: 'GET',
        dataType: 'json',
        success: (response) => {
            const posts = response.posts;
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                // postDiv.onclick = () => openPost(post.id);
                postDiv.innerHTML = `
                    <form action="/lostAndFound/post/${post.id}" method="GET">
                        <button class="bi bi-arrow-right-short" type="submit">
                        </button>
                    </form>
                    <span class="post-title">${post.title}</span>
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
    if (postTitle.value.length === 0){
        alert('Post title cannot be empty');
        return;
    }
    // if postTitle is more than 50 characters, return
    if (postTitle.value.length > 50){
        alert('Post title must be less than 50 characters');
        return;
    }
    const postBody = document.getElementById('create-post-body');
    // if postBody is empty, return
    if (postBody.value.length === 0){
        alert('Post message cannot be empty');
        return;
    }
    const userID = (await getCurrentUser())["id"];
    $.ajax({
        url: '/lostAndFound',
        method: 'POST',
        data: {
            userID: userID,
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

function openPost(postid){
    $.ajax({
        url: '/lostAndFound/post/' + postid,
        method: 'GET',
        dataType: 'json',
        success: () => {
            window.location.href = '/lostAndFound/post/' + postid;
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    })
}

function refreshPostList(){
    // Clear post container
    document.getElementById('post-container').innerHTML = '';
    // Refresh messages
    getAllUnresolvedPosts();
}

async function refreshMyPostList(){
    document.getElementById('post-container').innerHTML = '';
    const userID = (await getCurrentUser())["id"];
    openMyPosts(userID);
}

function openMyPosts(userID){
    $.ajax({
        url: '/lostAndFound/myPosts',
        method: 'GET',
        dataType: 'json',
        data: {
            userID: userID,
        },
        success(response){
            document.getElementById('post-container').innerHTML = '';
            const posts = response.posts;
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                // postDiv.onclick = () => openPost(post.id);
                postDiv.innerHTML = `
                    <form action="/lostAndFound/post/${post.id}" method="GET">
                        <button class="bi bi-arrow-right-short" type="submit">
                        </button>
                    </form>
                `;
                let resolvedDiv = document.createElement('button');
                resolvedDiv.type = 'button';
                if(post.resolved){
                    resolvedDiv.className = 'resolved';
                    resolvedDiv.innerHTML = 'Resolved';
                    postDiv.appendChild(resolvedDiv);
                }
                else{
                    const resolvePostForm = document.createElement('form');
                    resolvePostForm.action = '/lostAndFound/myPosts/resolve';
                    resolvePostForm.method = 'POST';
                    resolvePostForm.innerHTML = `
                        <input type="hidden" name="postID" value="${post.id}">
                            <button class="unresolved" type="submit">
                                Unresolved
                            </button>
                    `;
                    postDiv.appendChild(resolvePostForm);
                }
                postDiv.innerHTML += `
                    <span class="post-title">${post.title}</span>
                    <span class="post-time">${post.time}</span>
                    <span class="post-sender">${post.sender_name}</span>
                `;
                document.getElementById('post-container').appendChild(postDiv);
            });
        },
        error: (error) => {
            console.error('Failed to fetch messages:', error);
        },
    })
}

function resolvePost(postid){
    console.log(postid);
    // $.ajax({
    //     url: '/lostAndFound/myPosts/resolve',
    //     method: 'POST',
    //     dataType: 'json',
    //     data: {
    //         postID: postid,
    //     },
    //     success: () => {
    //         refreshMyPostList();
    //     },
    //     error: (error) => {
    //         console.error('Failed to fetch messages:', error);
    //     },
    // })
}