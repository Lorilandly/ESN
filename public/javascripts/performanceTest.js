let intervalID = null;
let testInProgress = false;

document.addEventListener('DOMContentLoaded', (event) => {
    document
        .getElementById('startPerformanceTest')
        .addEventListener('click', async () => {
            const interval = document.getElementById('interval').value;
            const duration = document.getElementById('duration').value;
            if (interval === '' || duration === '') {
                alert('Please enter a value for both interval and duration');
                return;
            }
            fetch('/performanceTest/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interval,
                    duration,
                }),
            })
                .then(async (res) => {
                    if (res.status !== 201) {
                        console.error(
                            'Failed to start performance test, doing nothing',
                        );
                        return;
                    }
                    document.getElementById('performance-setting').style =
                        'display: none';
                    document.getElementById('performance-ongoing').style =
                        'display: flex';
                    document.getElementById('test-results').style =
                        'display: none';
                    showTestProgress(duration);
                    const testResult = await startPerformanceTest(
                        duration,
                        interval,
                    );
                    if (testInProgress) {
                        stopPerformanceTest();
                        // Display test results
                        const partDuration = duration / 2;
                        const postsPerSecond =
                            testResult.postCompleted / partDuration;
                        const getsPerSecond =
                            testResult.getCompleted / partDuration;

                        document.getElementById('test-results').style =
                            'display: flex';
                        document.getElementById('post-result').innerHTML =
                            'POST requests completed per second: ' +
                            postsPerSecond;
                        document.getElementById('get-result').innerHTML =
                            'GET requests completed per second: ' +
                            getsPerSecond;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });

    document.getElementById('stopTest').addEventListener('click', async () => {
        stopPerformanceTest();
    });

    document.getElementById('search-bar').remove();
});

async function startPerformanceTest(duration, interval) {
    testInProgress = true;
    const startTime = new Date().getTime();
    // POST Requests
    let numPOSTSent = 0;
    let numPOSTCompleted = 0;
    const postDuration = duration / 2;

    while (testInProgress && !timeElapsed(postDuration, startTime)) {
        if (numPOSTSent > 1000) {
            alert('POST requests sent exceeded 1000');
            stopPerformanceTest();
            return;
        }
        const messageBody = generateMessage(numPOSTSent);
        $.ajax('/messages/public', {
            method: 'POST',
            data: { message: messageBody },
            dataType: 'json',
            success: () => {
                numPOSTCompleted++;
            },
            error: (error) => {
                console.error('API Error:', error);
            },
        });
        numPOSTSent++;
        await new Promise((_resolve) => setTimeout(_resolve, interval));
    }

    // GET Requests
    let numGETCompleted = 0;
    while (testInProgress && !timeElapsed(duration, startTime)) {
        $.ajax('/messages/public', {
            method: 'GET',
            dataType: 'json',
            success: () => {
                numGETCompleted++;
            },
            error: (error) => {
                console.error('API Error:', error);
            },
        });
        await new Promise((_resolve) => setTimeout(_resolve, interval));
    }
    // testResult should contain the number of post and get requests
    // completed at the time that the test expires
    const testResult = {
        postCompleted: numPOSTCompleted,
        getCompleted: numGETCompleted,
    };
    return testResult;
}

function timeElapsed(duration, startTime) {
    return new Date().getTime() - startTime > duration * 1000;
}

// Satisfies Test Payload Rule
function generateMessage(n) {
    const message = n.toString();
    return message + '-'.repeat(20 - message.length);
}

function stopPerformanceTest() {
    testInProgress = false;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';
    clearInterval(intervalID);
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
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function showTestProgress(duration) {
    const progressBar = document.getElementById('progress-bar');
    let width = 1;
    intervalID = setInterval(frame, duration * 10);
    function frame() {
        if (width >= 100) {
            clearInterval(intervalID);
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }
}

async function getTestMode() {
    const response = await fetch('/performanceTest/testStatus', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const json = await response.json();
    testInProgress = json.testModeActive;
    return json.testModeActive;
}

window.onload = async function () {
    if (await getTestMode()) {
        stopPerformanceTest();
    }
};

window.addEventListener('visibilitychange', async function () {
    if (testInProgress) {
        stopPerformanceTest();
    }
});
