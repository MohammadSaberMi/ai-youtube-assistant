#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getYoutubeCaptions, findYtDlpPath } = require('./yt-dlp-captions');

/**
 * Format time in milliseconds to MM:SS format
 * @param {number} milliseconds 
 * @returns {string}
 */
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Main function to get captions
 * @param {string} videoUrl - YouTube video URL
 * @param {string} outputFile - Path to save the captions (optional)
 * @param {string} cookiesFile - Path to cookies file (optional)
 * @param {string} lang - Language code for captions (default: 'en')
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cli-yt-dlp.js <YouTube_URL> [output_file] [cookies_file] [language]');
    console.log('Example: node cli-yt-dlp.js https://www.youtube.com/watch?v=dQw4w9WgXcQ captions.txt cookies.txt en');
    console.log('\nOptions:');
    console.log('  - YouTube_URL: URL of the YouTube video');
    console.log('  - output_file: Path to save the captions (optional)');
    console.log('  - cookies_file: Path to cookies file (optional, helps with restricted videos)');
    console.log('  - language: Language code for captions (default: en)');
    console.log('    Supported languages include: en (English), fa (Persian/Farsi), es (Spanish), etc.');
    
    // Check if yt-dlp is installed and print path
    try {
      const ytDlpPath = await findYtDlpPath();
      console.log(`\nFound yt-dlp at: ${ytDlpPath}`);
    } catch (error) {
      console.error('\nWarning: yt-dlp not found. Make sure to:');
      console.error('1. Install yt-dlp: https://github.com/yt-dlp/yt-dlp#installation');
      console.error('2. Add your Python Scripts directory to your PATH');
      console.error('   e.g., Add C:\\Users\\<username>\\AppData\\Roaming\\Python\\Python313\\Scripts to your PATH');
      console.error('3. Or set the YT_DLP_PATH environment variable to the location of yt-dlp.exe');
    }
    
    return;
  }
  
  const videoUrl = args[0];
  const outputFile = args.length > 1 ? args[1] : null;
  const cookiesFile = args.length > 2 ? args[2] : null;
  const lang = args.length > 3 ? args[3] : 'en';
  
  try {
    console.log(`Getting captions for YouTube video: ${videoUrl}`);
    
    // First, try to find yt-dlp
    try {
      const ytDlpPath = await findYtDlpPath();
      console.log(`Using yt-dlp from: ${ytDlpPath}`);
    } catch (error) {
      console.error('Error: yt-dlp not found in PATH');
      console.error(error.message);
      return;
    }
    
    if (cookiesFile) {
      console.log(`Using cookies file: ${cookiesFile}`);
    }
    
    // Get captions using yt-dlp
    const captionsData = await getYoutubeCaptions(videoUrl, {
      cookiesFile,
      lang,
      deleteSubtitleFile: outputFile ? false : true // Keep the file if outputFile is specified
    });
    
    if (outputFile) {
      // Format with timestamps
      const formattedTranscript = captionsData.segments.map(segment => 
        `[${formatTime(segment.startTime)}] ${segment.text}`
      ).join('\n');
      
      fs.writeFileSync(outputFile, formattedTranscript);
      console.log(`✅ Captions saved to: ${outputFile}`);
    } else {
      // Display captions in console
      console.log('\nTranscript:');
      console.log(captionsData.fullTranscript);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 