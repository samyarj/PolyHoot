const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
//const portfinder = require('portfinder');
const fs = require('fs');

let appWindow;
let server;
//let serverPort;

// Start a local server to serve the app
async function startServer() {
    console.log('Starting local server...');
    const expressApp = express();

    const clientPath = path.join(__dirname, 'dist/client');
    console.log('Serving static files from:', clientPath);
    console.log('Directory exists:', fs.existsSync(clientPath));

    expressApp.use(express.static(clientPath));

    expressApp.use((req, res, next) => {
        console.log(`Request: ${req.method} ${req.url}`);
        next();
    });

    expressApp.get('/', (req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
    });

    expressApp.use((req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
    });

    // Use a default port or dynamically find one
    const port = 4200; // or use portfinder.getPortPromise()

    server = expressApp.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    return port;
}

async function initWindow() {
    try {
        // Start local server first
        const port = await startServer();

        console.log('Creating browser window...');
        appWindow = new BrowserWindow({
            height: 1080,
            width: 1920,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                nativeWindowOpen: true,
                preload: path.join(__dirname, 'preload.js'), // optional, for safe IPC
            },

            autoHideMenuBar: true,
            title: 'PolyHoot',
        });

        // Load the application from the HTTP server
        const appUrl = `http://localhost:${port}`;
        console.log('Loading app from:', appUrl);
        appWindow.loadURL(appUrl);

        // Enable developer tools
        appWindow.webContents.openDevTools();

        // Monitor console logs from renderer
        appWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
            console.log(`[Renderer] ${message}`);
            console.log(`Source: ${sourceId}, Line: ${line}`);
        });

        // appWindow.on('close', (e) => {
        //     e.preventDefault();
        //     appWindow.webContents.send('app-close');
        // });
        appWindow.on('closed', () => {
            appWindow = null;
        });

        appWindow.on('closed', function () {
            appWindow = null;
        });
    } catch (error) {
        console.error('Error initializing window:', error);
    }
}

app.whenReady().then(initWindow);
const shutdown = () => {
    console.log('Application shutting down...');
    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
        });
    }
    if (appWindow) {
        appWindow.destroy();
    }
    app.quit();
};

app.on('before-quit', shutdown);

// Close when all windows are closed
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        if (server) {
            console.log('Closing server...');
            server.close();
        }
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});

// Add IPC handler for graceful closing
ipcMain.on('allow-close', () => {
    if (appWindow) {
        appWindow.destroy();
    }
    if (server) {
        server.close();
    }
});

// Handle any unhandled errors
process.on('uncaughtException', (error) => {
    console.error('Unhandled exception:', error);
});
