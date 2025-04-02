const express = require('express');
const http = require('http');
const path = require('path');

const appServer = express();

// Serve static files from the dist/client directory
appServer.use(express.static(path.join(__dirname, 'dist/client')));

// Handle all routes by serving index.html
appServer.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Catch-all route for SPA routing
appServer.get('*', (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, 'dist/client/index.html'));
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
appServer.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

const server = http.createServer(appServer);
server.listen(3007, function () {
    console.log('Express server listening on port 3007');
});
