const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Default yt-dlp paths to check
const YT_DLP_PATHS = {
  windows: [
    path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Python', 'Python39', 'Scripts', 'yt-dlp.exe'),
    'yt-dlp.exe',
    'yt-dlp'
  ],
  linux: [
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    'yt-dlp'
  ],
  darwin: [
    '/usr/local/bin/yt-dlp',
    '/opt/homebrew/bin/yt-dlp',
    'yt-dlp'
  ]
};

/**
 * Find the correct yt-dlp executable path
 * @returns {Promise<string>} Path to yt-dlp executable
 */
async function findYtDlpPath() {
  const platform = os.platform();
  let pathsToCheck = [];
  
  // Select paths based on platform
  if (platform === 'win32') {
    pathsToCheck = YT_DLP_PATHS.windows;
  } else if (platform === 'linux') {
    pathsToCheck = YT_DLP_PATHS.linux;
  } else if (platform === 'darwin') {
    pathsToCheck = YT_DLP_PATHS.darwin;
  } else {
    pathsToCheck = ['yt-dlp']; // Default fallback
  }
  
  // User-specified path from environment variable
  const envPath = process.env.YT_DLP_PATH;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }
  
  // Check each path
  for (const ytdlpPath of pathsToCheck) {
    try {
      // Windows-specific check
      if (platform === 'win32' && ytdlpPath !== 'yt-dlp' && ytdlpPath !== 'yt-dlp.exe') {
        if (fs.existsSync(ytdlpPath)) {
          return ytdlpPath;
        }
        continue;
      }
      
      // For other paths, try running it
      const result = spawn(ytdlpPath, ['--version']);
      
      // Wait for process to complete
      const success = await new Promise(resolve => {
        result.on('error', () => resolve(false));
        result.on('close', code => resolve(code === 0));
      });
      
      if (success) {
        return ytdlpPath;
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  throw new Error('Could not find yt-dlp. Please install it or set YT_DLP_PATH environment variable.');
}

/**
 * Download YouTube video captions using yt-dlp
 * @param {string} youtubeUrl - YouTube video URL
 * @param {string} cookiesFile - Path to cookies file (optional)
 * @param {string} lang - Language code for captions (default: 'en')
 * @param {string} outputDir - Directory to save captions (default: current directory)
 * @returns {Promise<string>} - Path to the downloaded subtitle file
 */
async function downloadCaptions(youtubeUrl, cookiesFile = null, lang = 'en', outputDir = '.') {
  const ytDlpPath = await findYtDlpPath();
  console.log(`Using yt-dlp from: ${ytDlpPath}`);
  
  return new Promise((resolve, reject) => {
    console.log(`Fetching captions for: ${youtubeUrl}`);
    
    // Create a safe filename using video ID
    const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || 'video';
    const safeOutputPath = path.join(outputDir, `${videoId}.%(ext)s`);
    
    // Prepare yt-dlp arguments
    const args = [
      '--write-sub',
      '--write-auto-sub',
      '--skip-download',
      `--sub-lang=${lang}`,
      '--convert-subs=vtt',
      `--output=${safeOutputPath}`
    ];
    
    // Add cookies file if provided
    if (cookiesFile && fs.existsSync(cookiesFile)) {
      args.push(`--cookies=${cookiesFile}`);
    }
    
    // Add the YouTube URL
    args.push(youtubeUrl);
    
    console.log('Running yt-dlp with args:', args.join(' '));
    
    // Run yt-dlp process
    const ytDlp = spawn(ytDlpPath, args);
    
    let outputData = '';
    let errorData = '';
    
    ytDlp.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      outputData += output;
    });
    
    ytDlp.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(error);
      errorData += error;
    });
    
    ytDlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}: ${errorData}`));
        return;
      }
      
      // Extract subtitle filename from output
      const subtitleMatch = outputData.match(/Writing video subtitles to: (.+\.vtt)/);
      if (subtitleMatch && subtitleMatch[1]) {
        const subtitlePath = subtitleMatch[1];
        console.log(`✅ Captions saved for video at: ${subtitlePath}`);
        resolve(subtitlePath);
      } else {
        // Try to find the file using the video ID
        const expectedPath = path.join(outputDir, `${videoId}.en.vtt`);
        if (fs.existsSync(expectedPath)) {
          console.log(`✅ Captions saved for video at: ${expectedPath}`);
          resolve(expectedPath);
        } else {
          reject(new Error('Could not find subtitle file in yt-dlp output'));
        }
      }
    });
  });
}

/**
 * Read downloaded captions file and return the text content
 * @param {string} subtitleFile - Path to the downloaded subtitle file
 * @returns {Promise<Object>} - Parsed captions with segments
 */
async function parseCaptions(subtitleFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(subtitleFile, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // Parse VTT format
        const segments = [];
        const lines = data.split('\n');
        let currentSegment = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip WebVTT header and empty lines
          if (line === 'WEBVTT' || line === '') continue;
          
          // Check if this is a timestamp line like "00:00:10.500 --> 00:00:12.500"
          const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
          if (timestampMatch) {
            if (currentSegment) {
              segments.push(currentSegment);
            }
            
            const startTime = timestampToMilliseconds(timestampMatch[1]);
            const endTime = timestampToMilliseconds(timestampMatch[2]);
            
            currentSegment = {
              startTime,
              endTime,
              duration: endTime - startTime,
              text: ''
            };
          } 
          // If not a timestamp and we have a current segment, it's the caption text
          else if (currentSegment && !line.match(/^\d+$/)) {  // Skip segment numbers
            if (currentSegment.text) {
              currentSegment.text += ' ' + line;
            } else {
              currentSegment.text = line;
            }
          }
        }
        
        // Add the last segment
        if (currentSegment) {
          segments.push(currentSegment);
        }
        
        // Format full transcript
        const fullTranscript = segments.map(segment => segment.text).join(' ');
        
        resolve({
          segments,
          fullTranscript
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Convert timestamp (HH:MM:SS.mmm) to milliseconds
 * @param {string} timestamp 
 * @returns {number} milliseconds
 */
function timestampToMilliseconds(timestamp) {
  const [hours, minutes, seconds] = timestamp.split(':').map(parseFloat);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Check if yt-dlp is installed
 * @returns {Promise<boolean>}
 */
async function checkYtDlpInstalled() {
  try {
    await findYtDlpPath();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get captions for a YouTube video
 * @param {string} youtubeUrl - YouTube video URL
 * @param {Object} options - Options for downloading captions
 * @returns {Promise<Object>} - Captions data
 */
async function getYoutubeCaptions(youtubeUrl, options = {}) {
  const {
    cookiesFile = null,
    lang = 'en',
    outputDir = '.',
    deleteSubtitleFile = true
  } = options;
  
  try {
    // Check if yt-dlp is installed
    const isYtDlpInstalled = await checkYtDlpInstalled();
    if (!isYtDlpInstalled) {
      throw new Error(`yt-dlp is not installed or not found in PATH. 
Please either:
1. Install yt-dlp: https://github.com/yt-dlp/yt-dlp#installation
2. Add C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\Python\\Python313\\Scripts to your PATH
3. Set the YT_DLP_PATH environment variable to the location of yt-dlp.exe`);
    }
    
    // Download captions with yt-dlp
    const subtitleFile = await downloadCaptions(youtubeUrl, cookiesFile, lang, outputDir);
    
    // Parse the VTT file
    const captionsData = await parseCaptions(subtitleFile);
    
    // Delete the subtitle file if requested
    if (deleteSubtitleFile) {
      fs.unlink(subtitleFile, (err) => {
        if (err) console.error(`Error deleting subtitle file: ${err.message}`);
      });
    }
    
    return {
      ...captionsData,
      videoUrl: youtubeUrl,
      subtitlePath: subtitleFile
    };
  } catch (error) {
    console.error('Error getting YouTube captions:', error);
    throw error;
  }
}

module.exports = {
  getYoutubeCaptions,
  downloadCaptions,
  parseCaptions,
  findYtDlpPath
}; 