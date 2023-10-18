var testInProgress = false;

document.getElementById('startTest').addEventListener('click', async () => {
    let interval = document.getElementById('interval').value;
    let duration = document.getElementById('duration').value;
    if(interval == '' || duration == ''){
        alert('Please enter a value for both interval and duration');
        return;
    }
    fetch('/performanceTest/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            interval: interval,
            duration: duration,
        }),
    })
    .then(async (res) => {
        console.log(`response: ${res.json()}`);
        document.getElementById('performance-setting').style = 'display: none';
        document.getElementById('performance-ongoing').style = 'display: flex';
        testInProgress = true;
        showTestProgress(duration);
        await new Promise(r => setTimeout(r, duration * 1000));
        document.getElementById('performance-ongoing').style = 'display: none';
        document.getElementById('performance-setting').style = 'display: flex';
        if (testInProgress) {
            stopPerformanceTest();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

document.getElementById('stopTest').addEventListener('click', async () => {
    stopPerformanceTest();
});

function stopPerformanceTest() {
    fetch('/performanceTest/stop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((res) => {
        console.log(`response: ${res.json()}`);
        document.getElementById('performance-setting').style = 'display: flex';
        document.getElementById('performance-ongoing').style = 'display: none';
        testInProgress = false;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function showTestProgress(duration){
    var progress_bar = document.getElementById('progress-bar');
    var width = 1;
    var id = setInterval(frame, duration * 10);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            progress_bar.style.width = width + '%';
        }
    }
}