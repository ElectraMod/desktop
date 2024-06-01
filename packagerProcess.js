const { exec } = require('child_process');
const path = require('path');

// Get the full path to the shell script
const scriptPath = path.join(__dirname, 'packagerProcess.sh');

// Execute the shell script using bash
exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
});
