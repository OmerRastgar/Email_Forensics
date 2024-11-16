


document.getElementById('submitButton').addEventListener('click', async function() {
    
    
    const mxToolboxSecret = "6b9fe39e-e165-485f-bfd2-9e36e06cdcaf";
    
    
    let emailContent = document.getElementById('emailInput').value;
    emailContent = emailContent.replace(/[\r\n]+/g, ' ');
    
    if (!emailContent) {
        alert('Please paste the raw email text.');
        return;
    }
    const sender = extractSender(emailContent);
    const receiver = extractReceiver(emailContent);
    const dateSent = extractDateSent(emailContent);
    const dateReceived = extractDateReceived(emailContent);
    const checks = extractChecks(emailContent);
    const attachment = extractAttachment(emailContent);
    const bodyText = extractBodyText(emailContent);
    const ipMatch = emailContent.match(/client-ip=([\d.:a-fA-F]+)/);
    const clientIp = ipMatch ? ipMatch[1] : null;
    const base64Regex = /Content-Transfer-Encoding: base64\s+([\s\S]*?)--_/;

    // Use match to extract the content
    const matches = emailContent.match(base64Regex);
    
        
        
    
    // Show data if present
    if (sender) {
        document.getElementById('senderLabel').textContent = sender;
    }
    if (receiver) {
        document.getElementById('receiverLabel').textContent = receiver;
    }
    if (dateSent) {
        document.getElementById('dateSentLabel').textContent = dateSent;
    }
    if (dateReceived) {
        document.getElementById('dateReceivedLabel').textContent = dateReceived;
    }

    if (checks) {
        document.getElementById('checksTable').style.display = 'block';
        document.getElementById('dmarcStatus').textContent = checks.dmarc || 'N/A';
        document.getElementById('dkimStatus').textContent = checks.dkim || 'N/A';
        document.getElementById('arcStatus').textContent = checks.arc || 'N/A';
        document.getElementById('spfStatus').textContent = checks.spf || 'N/A';
    }

    if (attachment) {
        document.getElementById('attachmentInfo').style.display = 'block';
        document.getElementById('attachmentFileName').textContent = attachment.filename || 'N/A';
    }

    if (bodyText) {
        document.getElementById('emailBody').style.display = 'block';
        document.getElementById('bodyText').textContent = bodyText;
    }


    function extractSender(content) {
        const senderMatch = content.match(/smtp\.mailfrom=([^\s]+)/);
        return senderMatch ? senderMatch[1] : null;
    }

    function extractReceiver(content) {
        const receiverMatch = content.match(/Delivered-To: ([^\s]+)/);
        return receiverMatch ? receiverMatch[1] : null;
    }

    function extractDateSent(content) {
        const dateMatch = content.match(/Received:.*\s([\w,]+\s\d{2}\s\w{3}\s\d{4}\s[\d:]+\s[+-]\d{4}\s\([\w]+\))/);
        return dateMatch ? dateMatch[1] : null;
    }

    function extractDateReceived(content) {
        const receivedDateMatch = content.match(/Received: by .*\s([\w,]+\s\d{2}\s\w{3}\s\d{4}\s[\d:]+\s[+-]\d{4}\s\([\w]+\))/);
        return receivedDateMatch ? receivedDateMatch[1] : null;
    }

    function extractChecks(content) {
        const checks = {};
        const dmarcMatch = content.match(/dmarc=([^\s]+)/);
        const dkimMatch = content.match(/dkim=([^\s]+)/);
        const arcMatch = content.match(/arc=([^\s]+)/);
        const spfMatch = content.match(/spf=([^\s]+)/);
        
        if (dmarcMatch) checks.dmarc = dmarcMatch[1];
        if (dkimMatch) checks.dkim = dkimMatch[1];
        if (arcMatch) checks.arc = arcMatch[1];
        if (spfMatch) checks.spf = spfMatch[1];

        return Object.keys(checks).length > 0 ? checks : null;
    }

    function extractAttachment(content) {
        const attachmentMatch = content.match(/filename="([^"]+)"/);
        return attachmentMatch ? { filename: attachmentMatch[1] } : null;
    }

    function extractBodyText(content) {
        const bodyMatch = emailContent.match(/Content-Transfer-Encoding:\s*quoted-printable\s+([\s\S]*?)(?=\s--|$)/);
        console.log(bodyMatch);
        return bodyMatch ? bodyMatch[1] : null;
    }






    function base64ToFile(base64, filename) {
        const byteString = atob(base64); // Decode Base64 to binary string
        const byteArray = new Uint8Array(byteString.length);
        
        // Convert binary string to Uint8Array
        for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }

        // Create a Blob with the binary data
        return new File([byteArray], filename, { type: 'application/octet-stream' });
        }



    try {
        const apiUrl = `https://api.mxtoolbox.com/api/v1/Lookup/blacklist/?argument=${clientIp}`;
        var apiKey2 = mxToolboxSecret; 

        fetch(apiUrl, {
            method: 'GET',
            headers: apiKey2 ? { 'Authorization': apiKey2 } : {}
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            // Get HTML elements
            const resultTable = document.getElementById('resultTable');
            const resultTableBody = document.getElementById('resultTableBody');
            const resultHeading = document.getElementById('resultHeading');
    
            // Function to add rows to the table
            function addEntriesToTable(dataArray, statusText, statusClass) {
                if (dataArray && dataArray.length > 0) {
                    dataArray.forEach(item => {
                        const tableRow = document.createElement('tr');
    
                        // Name column
                        const nameCell = document.createElement('td');
                        const link = document.createElement('a');
                        link.textContent = item.Name;
                        link.href = item.Url;
                        link.target = '_blank'; // Open link in a new tab
                        nameCell.appendChild(link);
    
                        // Status column
                        const statusCell = document.createElement('td');
                        statusCell.textContent = statusText;
                        statusCell.classList.add(statusClass);
    
                        // Details column
                        const detailsCell = document.createElement('td');
                        detailsCell.textContent = `Response Time: ${item.BlacklistResponseTime} ms`;
    
                        // Append cells to row
                        tableRow.appendChild(nameCell);
                        tableRow.appendChild(statusCell);
                        tableRow.appendChild(detailsCell);
    
                        // Append row to table body
                        resultTableBody.appendChild(tableRow);
                    });
                }
            }
    
            // Populate table with Passed and Failed entries
            addEntriesToTable(result.Passed, 'Passed', 'status-pass');
            addEntriesToTable(result.Failed, 'Failed', 'status-fail');
    
            // Display the table and heading if there are any entries
            if (result.Passed.length > 0 || result.Failed.length > 0) {
                resultTable.style.display = 'table';
                resultHeading.style.display = 'block';
            }
        })
        .catch(error => {
            console.error("Error fetching API:", error);
        });
        
    
        
        var myHeaders = new Headers();
        myHeaders.append("apikey", "d3ByMBaHNfXPdZNqjwR2IUYOQu1USHa4");

        

        var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: myHeaders,
        body: bodyText
        };
        let spamScore =0;
        var spamMessage = "This message is not considered spam.";
        fetch("https://api.apilayer.com/spamchecker?threshold=2", requestOptions)
        .then(response => response.text()) // Get the response as a text
        .then(result => {
            try {
                // Parse the JSON response
                const spamResult = JSON.parse(result);

                // Directly extract the properties from the object
                const isSpam = spamResult.is_spam;
                spamScore = spamResult.score;
                spamMessage = isSpam 
                    ? "This message is considered spam." 
                    : "This message is not considered spam.";

                // Display the result in the label
                const labelElement = document.getElementById('spamResultLabel');
                labelElement.textContent = `${spamMessage} (Score: ${spamScore})`;

            } catch (error) {
                console.log('Error parsing the JSON response:', error);
            }
        })
        .catch(error => console.log('Fetch error:', error));

        const apiKey = "b519aa58e1dff0f6ffe50e4db5a9791d8795d893e6dd4aee1c9ad9eea7799855";      
        if (matches && matches[1]) {
            const base64Content = matches[1].trim();
            console.log(base64Content);
            // Decode the base64 content
            const binaryString = atob(base64Content);
            const binaryLength = binaryString.length;
            const bytes = new Uint8Array(binaryLength);
    
            for (let i = 0; i < binaryLength; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
    
            // Create a Blob from the byte array (mimetype is 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' for .docx files)
            const file = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const formData = new FormData();
            formData.append('file', file, 'super_secret_document.docx');
    
            // VirusTotal API options
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'x-apikey':  apiKey // Replace with your VirusTotal API key
                },
                body: formData
               
            };
    
            try {
                // Sending the request to VirusTotal
                const response = await fetch('https://www.virustotal.com/api/v3/files', options);
                const result = await response.json();
                console.log(result);
                
            } catch (error) {
                console.error('Error uploading file:', error);
                
            }
        } else {
            console.error("Base64 content not found!");
            
        }
        console.log(clientIp);
        
        // API endpoint for IP location data
        const apiUrl22 = `http://ip-api.com/json/${clientIp}`;

        // Function to fetch location data from the API
        async function fetchLocationData() {
            try {
                const response = await fetch(apiUrl22);
                const data = await response.json();

                // Check if the status is success
                if (data.status === "success") {
                    displayLocationInfo(data);
                } else {
                    document.getElementById("location-info").innerText = "Failed to retrieve location data.";
                }
            } catch (error) {
                console.error("Error fetching location data:", error);
                document.getElementById("location-info").innerText = "An error occurred while fetching location data.";
            }
        }

        // Function to display location data
        function displayLocationInfo(data) {
            const locationDiv = document.getElementById("location-info");

            // Construct the HTML content
            const htmlContent = `
                <div class="label">Location:</div> ${data.city}, ${data.regionName}, ${data.country} <br>
                <div class="label">ZIP Code:</div> ${data.zip} <br>
                <div class="label">ISP:</div> ${data.isp} <br>
                <div class="label">Organization:</div> ${data.org} <br>
                <div class="label">Timezone:</div> ${data.timezone} <br>
                <img class="flag-img" src="https://flagsapi.com/${data.countryCode}/flat/64.png" alt="Flag of ${data.country}">
            `;

            // Insert the content into the div
            locationDiv.innerHTML = htmlContent;
        }

        // Fetch and display location data on page load
        fetchLocationData();









        const data1 = {
            labels: ['Sender', 'Recipient', 'Subject Analysis', 'Attachments', 'Spam Score'],
            values: [5, 10, 7, 3, 8],
            summary: 'This is a summary of test analysis data.'
        };

        const data2 = {
            labels: ['Sender', 'Recipient', 'Subject Analysis', 'Attachments', 'routing'],
            values: [54, 150, 37, 1, 20],
            summary: 'Viewing the overall email content shows that this may not be the likely vectore through which the Malware was introduced'
        };
        // Fill the charts
        createChart('chart1', ["Spam Score"], [Number(spamScore)], 'Checking Email legitimaty');
        createChart('chart2', data2.labels, data2.values, 'Analysis Chart 2');

        // Display text results (optional)
        document.getElementById('results').innerText = `Analysis: ${spamMessage}\nAnalysis 2 Summary: ${data2.summary}`;

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
