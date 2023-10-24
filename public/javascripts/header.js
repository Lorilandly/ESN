function shakeIndicator(){
    const indicator = document.getElementById("notification");
    console.log(indicator);
    indicator.style.animation = "shake 0.1s";
    indicator.style.animationIterationCount = "5";

    indicator.addEventListener('animationend', () => {
        indicator.style.animation = '';
    });
}