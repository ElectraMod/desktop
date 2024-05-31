const { app, BrowserWindow } = require('electron');
const path = require('path');

// Function to configure a window
const configureWindow = (win) => {
  win.setMenuBarVisibility(false);

  win.webContents.on('page-title-updated', (event, title) => {
    let newTitle = title;
    if (title.startsWith('ElectraMod -')) {
      newTitle = title.replace('ElectraMod -', 'ElectraMod Desktop -');
    } else if (title.endsWith('- ElectraMod')) {
      newTitle = title.replace('- ElectraMod', '- ElectraMod Desktop');
    } else if (title.startsWith('PenguinMod -')) {
      newTitle = title.replace('PenguinMod -', 'ElectraMod Desktop -');
    } else if (title.endsWith('- PenguinMod')) {
      newTitle = title.replace('- PenguinMod', '- ElectraMod Desktop');
    } 
    if (newTitle !== title) {
      event.preventDefault(); // Prevent default title update
      win.setTitle(newTitle);  // Update with the new title
    }
  });
};

// Function to create the main window
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 600,
    icon: path.join(__dirname, 'assets', 'icon', 'icon.png'),
    webPreferences: {
      devTools: true,
    }
  });

  mainWindow.loadFile('build/index.html');
  configureWindow(mainWindow);

  // Event to handle new windows (popups, etc.)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    createPopupWindow(url);
    return { action: 'deny' }; // Prevent default behavior (opening in a new browser window)
  });
};

// Function to create a popup window
const createPopupWindow = (url) => {
  const popupWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets', 'icon', 'icon.png'),
    webPreferences: {
      devTools: true,
    }
  });

  popupWindow.loadURL(url);
  configureWindow(popupWindow);
};

// App lifecycle events
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
