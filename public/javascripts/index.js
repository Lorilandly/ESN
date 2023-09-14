/* this function allows the user to join the community once clicking the join button */
function join(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    /* username and password validation here
    if is valid, submit form
    else show error message or alert
    also handle null values */
    document.getElementById("main-form").method = "POST";
    document.getElementById("main-form").action = "/join";
    document.getElementById("main-form").submit();
}