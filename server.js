const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/health', (req, res) => res.send('Online'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/check-region', (req, res) => {
    const url = 'https://ipinfo.io/json';

    https.get(url, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                res.json(JSON.parse(data));
            } catch (e) {
                res.status(500).send('Error parsing data');
            }
        });
    }).on('error', (err) => {
        res.status(500).send('Error fetching IP');
    });
});



wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        
        // --- THE FIX IS HERE ---
        // Convert binary Buffer to String before sending back
        const timestamp = message.toString();
        
        ws.send(timestamp);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
