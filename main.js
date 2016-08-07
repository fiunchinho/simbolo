import app from 'app';
import BrowserWindow from 'browser-window';
import openMarket from './src/Simbolo';
import {ipcMain} from 'electron';
var {Tray} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

app.on('ready', function () {
// Create the browser window.
    mainWindow = new BrowserWindow({width: 1024, height: 768});

    const path = require('path')
	const electron = require('electron')
	const clipboard = require('electron').clipboard
	const ipc = electron.ipcMain

    mainWindow.loadURL('file://' + __dirname + '/view/index.html');
    mainWindow.webContents.openDevTools();

    ipc.on('new-account', function(event, data){
		event.sender.send('new-account', data);
	});

	// Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// if (trayIcon) trayIcon.destroy();
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});