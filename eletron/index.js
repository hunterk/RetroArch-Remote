const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

let tray = null;
/*let mainWindow = null;*/
let ipAddress = null;
let defaultIPAddress = "localhost";

// Retrieve the user input from the BrowserWindow
ipAddress = getUserInput() || defaultIPAddress; // Use default if user input is empty

app.on('ready', () => {
//  createWindow();
    createTray();
    
    ipcMain.on('user-command', (event, ipAddress) => {
        runCommand(ipAddress);
    });
    
/*    ipcMain.on('user-command', (event, shaderPath) => {
        runCommand(shaderPath);
    });
*/
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load the index.html file of your Electron app
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open DevTools - Remove this line in production
    // mainWindow.webContents.openDevTools();
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function loadNextDisc() {
   runCommand(`echo -n "DISK_EJECT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`);
   sleep(1000);
   runCommand(`echo -n "DISK_NEXT" | nc -u -w1 "${ipAddress}" 55355`);
   sleep(1000);
   runCommand(`echo -n "DISK_EJECT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`);
}

function loadPrevDisc() {
   runCommand(`echo -n "DISK_EJECT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`);
   sleep(1000);
   runCommand(`echo -n "DISK_PREV" | nc -u -w1 "${ipAddress}" 55355`);
   sleep(1000);
   runCommand(`echo -n "DISK_EJECT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`);
}

function createTray() {
    let iconFileName;
    let iconPath;
    iconPath = './'
    switch (process.platform) {
        case 'win32':
            iconFileName = 'retroarch.ico';
            break;
        case 'darwin':
            iconFileName = 'retroarch.icns';
            break;
        case 'linux':
            iconFileName = 'retroarch-96x96.png';
            break;
        default:
            iconFileName = 'retroarch-96x96.png';
    }
    const iconFullPath = path.join(iconPath, iconFileName);
    tray = new Tray(iconFullPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'RetroArch Commands',
            submenu: [
                { label: 'Save State to Current Slot', click: () => runCommand(`echo -n "SAVE_STATE" | nc -u -w1 "${ipAddress}" 55355`) },
                { label: 'Load Current State Slot', click: () => runCommand(`echo -n "LOAD_STATE" | nc -u -w1 ""${ipAddress}"" 55355`) },
                {
                    label: 'Manage State Slot',
                    submenu: [
                        { label: 'Load Specific State Slot', submenu:[
                                                               { label: 'Load Slot 0', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 0'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 1', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 1'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 2', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 2'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 3', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 3'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 4', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 4'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 5', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 5'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 6', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 6'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 7', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 7'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 8', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 8'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 9', click: () => runCommand(`echo -n "'LOAD_STATE_SLOT 9'" | nc -u -w1 "${ipAddress}" 55355`) }
                                                               ] },
                        { label: 'Next State Slot', click: () => runCommand(`echo -n "STATE_SLOT_PLUS" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Prev. State Slot', click: () => runCommand(`echo -n "STATE_SLOT_MINUS" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Cheats',
                    submenu: [
                        { label: 'Cheats On/Off', click: () => runCommand(`echo -n "CHEAT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Next Cheat Index', click: () => runCommand(`echo -n "CHEAT_INDEX_PLUS" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Prev. Cheat Index', click: () => runCommand(`echo -n "CHEAT_INDEX_MINUS" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
                {
                    label: 'Netplay',
                    submenu: [
                        { label: 'Hosting Start/Stop', click: () => runCommand(`echo -n "NETPLAY_HOST_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Ping Show/Hide', click: () => runCommand(`echo -n "NETPLAY_PING_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Watch Game', click: () => runCommand(`echo -n "NEPLAY_GAME_WATCH" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Chat Enter/Exit', click: () => runCommand(`echo -n "NETPLAY_PLAYER_CHAT" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Chat Show/Hide', click: () => runCommand(`echo -n "NETPLAY_FADE_CHAT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
                {
                    label: 'Recording/Replays',
                    submenu: [
                        { label: 'Take Screenshot', click: () => runCommand(`echo -n "SCREENSHOT" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Video Recording', submenu:[
                                                      { label: 'Start Recording', click: () => runCommand(`echo -n "RECORDING_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Start Streaming', click: () => runCommand(`echo -n "STREAMING_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) }
                                                      ] },
                        { label: 'Input Recording/Playback', submenu:[
                                                      { label: 'Start Input Logging', click: () => runCommand(`echo -n "RECORD_REPLAY" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Playback Input Log', click: () => runCommand(`echo -n "PLAY_REPLAY" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Stop Input Playback', click: () => runCommand(`echo -n "HALT_REPLAY" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Next Input Log Slot', click: () => runCommand(`echo -n "REPLAY_SLOT_PLUS" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Prev. Input Log Slot', click: () => runCommand(`echo -n "REPLAY_SLOT_MINUS" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Load Specific Input Log Slot', submenu:[
                                                               { label: 'Load Slot 0', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 0'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 1', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 1'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 2', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 2'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 3', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 3'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 4', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 4'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 5', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 5'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 6', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 6'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 7', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 7'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 8', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 8'" | nc -u -w1 "${ipAddress}" 55355`) },
                                                               { label: 'Load Slot 9', click: () => runCommand(`echo -n "'PLAY_REPLAY_SLOT 9'" | nc -u -w1 "${ipAddress}" 55355`) }
                                                               ] },
                                                      ] }
                    ]
                },
                {
                    label: 'Frame Throttle',
                    submenu: [
                        { label: 'Pause/Resume', click: () => runCommand(`echo -n "PAUSE_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Fast-Forward On/Off', click: () => runCommand(`echo -n "FAST_FORWARD" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Rewind On/Off', click: () => runCommand(`echo -n "REWIND" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Frame Advance', click: () => runCommand(`echo -n "FRAMEADVANCE" | nc -u -w1 "${ipAddress}" 55355`) },
//                        { label: 'Sync To Exact Content Framerate', click: () => runCommand(`echo -n "VRR_RUNLOOP_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
                {
                    label: 'Latency Reduction',
                    submenu: [
                        { label: 'Runahead On/Off', click: () => runCommand(`echo -n "RUNAHEAD_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Preemptive Frames On/Off', click: () => runCommand(`echo -n "PREEMPT_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
                {
                    label: 'Video Display',
                    submenu: [
                        { label: 'Shaders', submenu:[
                                                      { label: 'Shaders On/Off', click: () => runCommand(`echo -n "SHADER_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Load Next Shader Preset', click: () => runCommand(`echo -n "SHADER_NEXT" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Load Prev. Shader Preset', click: () => runCommand(`echo -n "SHADER_PREV" | nc -u -w1 "${ipAddress}" 55355`) }
                                                      ] },
                        { label: 'Overlay', submenu:[
                                                      { label: 'Cycle Overlay Layout', click: () => runCommand(`echo -n "OVERLAY_NEXT" | nc -u -w1 "${ipAddress}" 55355`) },
                                                      { label: 'Keyboard Overlay Show/Hide', click: () => runCommand(`echo -n "OSK" | nc -u -w1 "${ipAddress}" 55355`) }
                                                      ] },
                        { label: 'Fullscreen Mode On/Off', click: () => runCommand(`echo -n "FULLSCREEN_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
                {
                    label: 'Diagnostics',
                    submenu: [
                        { label: 'FPS Counter Show/Hide', click: () => runCommand(`echo -n "FPS_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
                        { label: 'Statistics Show/Hide', click: () => runCommand(`echo -n "STATISTICS_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) }
                    ]
                },
            ]
        },
        { label: 'Menu Open/Close', click: () => runCommand(`echo -n "MENU_TOGGLE" | nc -u -w1 "${ipAddress}" 55355`) },
        { type: 'separator' },
        { label: 'Load Next Disc', click: () => loadNextDisc() },
        { label: 'Load Prev. Disc', click: () => loadPrevDisc() },
        { type: 'separator' },
        { label: 'Activate AI Service', click: () => runCommand(`echo -n "AI_SERVICE" | nc -u -w1 "${ipAddress}" 55355`) },
//        { label: 'Set User Shader', click: () => runCommand(`echo -n "SET_SHADER ${shaderPath}" | nc -u -w1 "${ipAddress}" 55355`) },
        { type: 'separator' },
        { label: 'Quit RetroArch-Remote', role: 'quit' }
    ]);

    tray.setContextMenu(contextMenu);
};

function getUserInput() {
    return ipAddress;
}
/*
function getUserShader() {
    return shaderPath;
}

function getUserMsg() {
    return userMsg;
}
*/
function runCommand(command) {
    // localize command line functions here
    switch (process.platform) {
        case 'win32':
            exec(`cmd.exe /c "${command}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return;
                }
                console.log(`Command output: ${stdout}`);
            });
            break;
        case 'darwin':
            exec(`zsh -c "${command}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return;
                }
                console.log(`Command output: ${stdout}`);
            });
            break;
        case 'linux':
            exec(`sh -c "${command}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return;
                }
                console.log(`Command output: ${stdout}`);
            });
            break;
        default:
            console.error(`Unsupported platform: ${os.platform()}`);
    }
}
