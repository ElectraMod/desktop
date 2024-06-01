const { app, BrowserWindow } = require('electron');
const path = require('path');
const RPC = require('discord-rpc');
const axios = require('axios');
const _ = require('lodash');

// Définir le Client ID Discord
const clientId = '1246126898023497878';

// Créer un client RPC
const rpc = new RPC.Client({ transport: 'ipc' });

const extractHashNumbers = (url) => {
  const regex = /#(\d+)(?:\?.*)?$/;
  const match = url.match(regex);
  return match ? Number(match[1]) : null;
};

function fetchEMAPIProject(id) {
  const url = 'https://projects.mubi.tech/api/projects/search?project';

  return axios.get(url)
    .then(response => {
      const data = response.data;

      // Trouver l'objet avec l'id désiré
      const project = _.find(data.projects, { id: id });

      if (project) {
        console.log('Project found:', project);
        return project; // Renvoyer le projet trouvé
      } else {
        console.log('Project not found');
        return null; // Renvoyer null si le projet n'est pas trouvé
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      return null; // Renvoyer null en cas d'erreur
    });
}

// Définir les activités
let startTimestamp = new Date();
const setActivity = (details, state) => {
  rpc.setActivity({
    details: details,
    state: state,
    startTimestamp: startTimestamp,
    largeImageKey: 'icon',
    largeImageText: 'ElectraMod',
    instance: false,
  });
};

// Event 'ready' du client RPC
rpc.on('ready', () => {
  console.log('Discord RPC is now active');
  setActivity('Starting', 'Initializing');
});

// Connexion à Discord
rpc.login({ clientId }).catch(console.error);


// Définir updateActivity dans le scope global
let previousURL = '';

const updateActivity = async (win) => {
  if (!win.isDestroyed()) {
    const currentURL = win.webContents.getURL();
    if (currentURL !== previousURL) {
      console.log('changed page!', currentURL);
      if (currentURL.includes('/build/index.html') || currentURL.includes('electramod.vercel.app/')) {
        if (currentURL.includes('#')) {
          if (!currentURL.includes('#0')) {
            const projectId = extractHashNumbers(currentURL);
            const project = await fetchEMAPIProject(projectId);
            if (project) {
              setActivity(`Plays ${project.name}`, `by ${project.owner}`);
            } else {
              console.log('Project not found');
              setActivity('in Editor', 'Code Editor');
            }
          } else {
            setActivity('in Editor', 'Code Editor');
          }
        } else {
          setActivity('in Editor', 'Code Editor');
        }
      }
      previousURL = currentURL;
    }
  }
};

// Fonction pour configurer une fenêtre
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

  win.webContents.on('did-navigate-in-page', () => {
    updateActivity(win);
  });

  win.on('focus', () => {
    updateActivity(win);
  });
};

// Fonction pour créer la fenêtre principale
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

  // Gérer les nouvelles fenêtres (popups, etc.)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    createPopupWindow(url);
    return { action: 'deny' }; // Empêcher le comportement par défaut (ouverture dans une nouvelle fenêtre de navigateur)
  });
};

// Fonction pour créer une fenêtre popup
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

// Evénements du cycle de vie de l'application
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
