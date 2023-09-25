function home() {
    document.getElementById("main-form").method = "POST";
    document.getElementById("main-form").action = "/users";
    document.getElementById("main-form").submit();
}
