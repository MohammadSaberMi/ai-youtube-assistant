#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Common locations for Python scripts on Windows
const commonPythonScriptLocations = [
  path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python313', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python310', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python39', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'Scripts'),
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python39', 'Scripts'),
];

// Check if a path contains yt-dlp.exe
function checkForYtDlp(directory) {
  if (!fs.existsSync(directory)) {
    return false;
  }
  
  const ytDlpPath = path.join(directory, 'yt-dlp.exe');
  return fs.existsSync(ytDlpPath) ? ytDlpPath : false;
}

// Find yt-dlp by searching common locations
async function findYtDlp() {
  // Check if yt-dlp is on PATH
  try {
    const ytDlp = spawn('yt-dlp', ['--version']);
    const found = await new Promise(resolve => {
      ytDlp.on('error', () => resolve(false));
      ytDlp.on('close', code => resolve(code === 0));
    });
    
    if (found) {
      return 'yt-dlp'; // yt-dlp is on PATH
    }
  } catch (error) {
    // Continue searching
  }
  
  // Check common Python script locations
  for (const location of commonPythonScriptLocations) {
    const result = checkForYtDlp(location);
    if (result) {
      return result;
    }
  }
  
  return null;
}

// Set environment variable for the current session
function setEnvVar(name, value) {
  process.env[name] = value;
  console.log(`Environment variable ${name} set to ${value} for the current session.`);
}

// Create a .env file
function createEnvFile(name, value) {
  const envContent = `# YouTube Caption Extractor Environment Variables
${name}=${value}
`;

  fs.writeFileSync('.env', envContent);
  console.log('Created .env file with YT_DLP_PATH.');
}

// Check if we need to create a .bat file for Windows environment variable
function createBatFile(name, value) {
  if (os.platform() !== 'win32') return;
  
  const batContent = `@echo off
echo Setting ${name} environment variable...
setx ${name} "${value}"
echo Done! The environment variable has been set.
echo Please restart your command prompt for the changes to take effect.
pause
`;

  fs.writeFileSync('set-env-var.bat', batContent);
  console.log('Created set-env-var.bat for setting system environment variable.');
  console.log('Run this file as administrator to set the variable permanently.');
}

// Main function
async function main() {
  console.log('YouTube Caption Extractor - yt-dlp Setup Helper');
  console.log('=============================================');
  
  // Try to find yt-dlp
  console.log('Searching for yt-dlp...');
  const ytDlpPath = await findYtDlp();
  
  if (ytDlpPath) {
    console.log(`Found yt-dlp at: ${ytDlpPath}`);
    
    if (ytDlpPath === 'yt-dlp') {
      console.log('yt-dlp is already in your PATH. No further setup needed!');
      rl.close();
      return;
    }
    
    // Ask if user wants to set up the environment variable
    rl.question('Would you like to set up the YT_DLP_PATH environment variable? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        // Set environment variable for current session
        setEnvVar('YT_DLP_PATH', ytDlpPath);
        
        // Create .env file
        createEnvFile('YT_DLP_PATH', ytDlpPath);
        
        // Create .bat file for Windows
        createBatFile('YT_DLP_PATH', ytDlpPath);
        
        console.log('\nSetup complete!');
        console.log('1. For the current session, the environment variable has been set.');
        console.log('2. A .env file has been created for the application.');
        console.log('3. You can run set-env-var.bat as administrator to set the variable permanently.');
      } else {
        console.log('Setup cancelled.');
      }
      
      rl.close();
    });
  } else {
    console.log('Could not find yt-dlp in common locations.');
    console.log('\nPlease make sure you have installed yt-dlp:');
    console.log('1. Install yt-dlp: https://github.com/yt-dlp/yt-dlp#installation');
    console.log('2. If you know the path to yt-dlp.exe, you can set it manually:');
    
    rl.question('Enter the full path to yt-dlp.exe (or press Enter to cancel): ', (answer) => {
      if (answer && answer.trim()) {
        const customPath = answer.trim();
        
        if (fs.existsSync(customPath)) {
          // Set environment variable for current session
          setEnvVar('YT_DLP_PATH', customPath);
          
          // Create .env file
          createEnvFile('YT_DLP_PATH', customPath);
          
          // Create .bat file for Windows
          createBatFile('YT_DLP_PATH', customPath);
          
          console.log('\nSetup complete!');
        } else {
          console.log('The specified file does not exist. Setup cancelled.');
        }
      } else {
        console.log('Setup cancelled.');
      }
      
      rl.close();
    });
  }
}

main(); 