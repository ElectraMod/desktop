const axios = require('axios');
const _ = require('lodash');

const url = 'https://projects.mubi.tech/api/projects/search?project';

axios.get(url)
  .then(response => {
    const data = response.data;

    // Trouver l'objet avec l'id désiré
    const project = _.find(data.projects, { id: 1949384958273 });

    if (project) {
      console.log('Project found:', project);
    } else {
      console.log('Project not found');
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
