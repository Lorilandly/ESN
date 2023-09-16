function home(){
    document.getElementById("main-form").method = "POST";
    document.getElementById("main-form").action = "/home";
    document.getElementById("main-form").submit();
}