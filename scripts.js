document.getElementById('submitButton').addEventListener('click', async function() {
    const emailInput = document.getElementById('emailInput').value;

    if (!emailInput) {
        alert('Please paste the raw email text.');
        return;
    }

    try {
        // Simulate POST requests to fetch data for charts and analysis
        const response1 = await fetch('https://example.com/api/analyze1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailData: emailInput })
        });
        const response2 = await fetch('https://example.com/api/analyze2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailData: emailInput })
        });

        const data1 = await response1.json();
        const data2 = await response2.json();

        // Fill the charts
        createChart('chart1', data1.labels, data1.values, 'Analysis Chart 1');
        createChart('chart2', data2.labels, data2.values, 'Analysis Chart 2');

        // Display text results (optional)
        document.getElementById('results').innerText = `Analysis 1 Summary: ${data1.summary}\nAnalysis 2 Summary: ${data2.summary}`;

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching analysis data.');
    }
});

function createChart(chartId, labels, data, title) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
