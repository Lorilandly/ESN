document.getElementById('startTest').addEventListener('click', () => {
    let interval = document.getElementById('interval').value;
    let duration = document.getElementById('duration').value;
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
        .then((res) => {
            console.log(`response: ${res.json()}`);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});
