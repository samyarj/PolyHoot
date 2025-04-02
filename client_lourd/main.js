const { app, BrowserWindow } = require('electron');
const express = require('express');
const path = require('path');

let appWindow;
const PORT = 3001;

// Set up an Express server to serve the frontend
const server = express();
server.use(express.static(path.join(__dirname, 'dist/client')));
server.listen(PORT, () => console.log(`Application running at http://localhost:${PORT}`));

function initWindow() {
    appWindow = new BrowserWindow({
        height: 1080,
        width: 1920,
        webPreferences: {
            nodeIntegration: true, // Keep this if needed, but Firebase prefers web security.
        },
    });

    // Load the app via localhost instead of file://
    appWindow.loadURL(`http://localhost:${PORT}`);

    appWindow.setMenuBarVisibility(false);

    // Open DevTools for debugging
    appWindow.webContents.openDevTools();

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});
