// Importer les modules nécessaires
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
const setActivity = (details, state) => {
  rpc.setActivity({
    details: details,
    state: state,
    startTimestamp: new Date(),
    largeImageKey: 'icon', // Configurez cela dans l'application Discord Developer
    largeImageText: 'ElectraMod',
    instance: false,
  });
};

// Event 'ready' du client RPC
rpc.on('ready', () => {
  console.log('Discord RPC is now active');
});

// Connexion à Discord
rpc.login({ clientId }).catch(console.error);

// Fonction pour configurer une fenêtre
const configureWindow = (win) => {
  win.setMenuBarVisibility(false);
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

  let previousURL = '';

  const updateActivity = async (url) => {
    if (url !== previousURL) {
      console.log('changed page!', url);
      if (url.includes('/build/index.html')) {
        if (url.includes('#')) {
          if (!url.includes('#0')) {
            const projectId = extractHashNumbers(url);
            const project = await fetchEMAPIProject(projectId); // Attendre la résolution de la promesse
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
      previousURL = url;
    }
  };
  

  // Utiliser setInterval pour vérifier l'URL actuelle toutes les secondes
  setInterval(() => {
    const currentURL = mainWindow.webContents.getURL();
    updateActivity(currentURL);
  }, 1000);

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
