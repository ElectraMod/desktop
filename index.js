const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 960,
    height: 600,
    icon: './assets/icon/icon.png',
    webPreferences: {
      devTools: true,
    }
  })

  win.loadFile('build/index.html')

  win.setMenuBarVisibility(false)

}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
