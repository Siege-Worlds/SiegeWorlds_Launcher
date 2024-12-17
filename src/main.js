/**
 * @description The main entry point of the program
 * @author Jake O'Connor
 * @date 21/03/2021
 * 
 * Games Interactive Limited www.gamesinteractive.co.uk
 */


const { app, BrowserWindow, Menu } = require('electron');
const path = require('path')
const url = require('url')

//const update_electron = require('update-electron-app')({
//    repo: 'github-user/repo',
//    updateInterval: '1 hour',
//    logger: require('electron-log')
//})

/**Main function for cretion of the app window */
function createWindow() {
    const win = new BrowserWindow({
        width: 550,
        height: 350,
        backgroundColor: '#000000',
        //frame: false,
        icon: "src/icons/logo.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        show: false
    })

    win.loadURL(path.join('file://', __dirname, 'index.html'))

    win.resizable = false;
    // win.webContents.openDevTools();

    //hide the menu
    Menu.setApplicationMenu(null);

    //make sure window doesn't show until it has rendered for the first time
    win.once('ready-to-show', () => {
        win.show()
    })

}


/**
 * events for the app window
 */
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.whenReady().then(createWindow)