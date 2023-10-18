var testInProgress = false;

document.getElementById('startTest').addEventListener('click', async () => {
    let interval = document.getElementById('interval').value;
    let duration = document.getElementById('duration').value;
    if (interval == '' || duration == '') {
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
            document.getElementById('performance-setting').style =
                'display: none';
            document.getElementById('performance-ongoing').style =
                'display: flex';

            showTestProgress(duration);
            await startPerformanceTest(duration, interval);
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

async function startPerformanceTest(duration, interval) {
    testInProgress = true;
    let startTime = new Date().getTime();
    // POST Requests
    let numPOST = 0;
    let postDuration = duration / 2;
    while (
        testInProgress &&
        !timeElapsed(postDuration, startTime) &&
        numPOST < 1000
    ) {
        messageBody = generateMessage(numPOST);
        $.ajax('/publicMessages', {
            method: 'POST',
            data: { message: messageBody },
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });
        numPOST++;
        await new Promise((r) => setTimeout(r, interval));
    }
    // GET Requests
    while (testInProgress && !timeElapsed(duration, startTime)) {
        $.ajax('/publicMessages', {
            method: 'GET',
            dataType: 'json',
            error: (error) => {
                console.error('API Error:', error);
            },
        });
        await new Promise((r) => setTimeout(r, interval));
    }
}

function timeElapsed(duration, startTime) {
    return new Date().getTime() - startTime > duration * 1000;
}

// Satisfies Test Payload Rule
function generateMessage(n) {
    message = n.toString();
    message += '-'.repeat(20 - message.length);
    return message;
}

function stopPerformanceTest() {
    fetch('/performanceTest/stop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => {
            document.getElementById('performance-setting').style =
                'display: flex';
            document.getElementById('performance-ongoing').style =
                'display: none';
            testInProgress = false;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function showTestProgress(duration) {
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
