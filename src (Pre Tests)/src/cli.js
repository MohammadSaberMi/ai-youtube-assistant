#!/usr/bin/env node

const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { fetchWithRetry, detectWindowsSystemProxy } = require('./proxy-util');

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

async function getCaptions(videoUrl, outputFile = null) {
  try {
    console.log(`Fetching captions for: ${videoUrl}`);
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      console.error('Error: Invalid YouTube URL');
      return;
    }
    
    // Check if Windows proxy is configured
    if (process.platform === 'win32') {
      const proxyUrl = detectWindowsSystemProxy();
      if (proxyUrl) {
        console.log(`Using Windows system proxy: ${proxyUrl}`);
      } else {
        console.log('No Windows system proxy detected, using direct connection');
      }
    }
    
    // Check internet connection first
    try {
      console.log('Checking internet connection...');
      await fetchWithRetry('https://www.google.com', {}, 1, 300, true);
    } catch (networkErr) {
      console.error('Error: No internet connection. Please check your network settings.');
      return;
    }

    // Get video info
    console.log(`Fetching video info for ID: ${videoId}`);
    let videoInfo;
    try {
      videoInfo = await ytdl.getInfo(videoId);
    } catch (ytdlError) {
      console.error('Error fetching video info:', ytdlError.message);
      console.log('This could be due to:');
      console.log('- Network connectivity issues');
      console.log('- YouTube blocking the request (the app will try using your Windows system proxy if configured)');
      console.log('- The video might be private or unavailable');
      return;
    }
    
    // Get caption tracks
    const captionTracks = videoInfo.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      console.error('Error: No captions found for this video');
      return;
    }
    
    // Get the first available caption track (usually English)
    // You could also filter by language code (e.g., 'en')
    const captionTrack = captionTracks[0];
    console.log(`Found caption track: ${captionTrack.name?.simpleText || 'Unnamed'} (${captionTrack.languageCode})`);
    
    // Fetch the captions XML
    const captionUrl = captionTrack.baseUrl;
    console.log(`Fetching captions from: ${captionUrl}`);
    
    let captionXml;
    try {
      // Use the system proxy
      const captionResponse = await fetchWithRetry(captionUrl, {}, 3, 300, true);
      captionXml = await captionResponse.text();
    } catch (fetchError) {
      console.error('Error fetching captions:', fetchError.message);
      if (fetchError.code === 'ETIMEDOUT' || fetchError.code === 'ECONNREFUSED') {
        console.log('\nThis looks like a network timeout issue. Try:');
        console.log('1. Checking your internet connection');
        console.log('2. The app is already using your Windows system proxy settings if configured');
        console.log('3. Trying again later as YouTube might be temporarily unavailable');
      }
      return;
    }
    
    // Parse XML to extract text
    const captionSegments = parseCaptionXml(captionXml);
    const fullTranscript = captionSegments.map(segment => segment.text).join(' ');
    
    // Format with timestamps
    const formattedTranscript = captionSegments.map(segment => 
      `[${formatTime(segment.offset)}] ${segment.text}`
    ).join('\n');
    
    if (outputFile) {
      fs.writeFileSync(outputFile, formattedTranscript);
      console.log(`Captions saved to: ${outputFile}`);
    } else {
      console.log('\nTranscript:');
      console.log(formattedTranscript);
    }
    
    return { videoId, fullTranscript, segments: captionSegments };
  } catch (error) {
    console.error('Error fetching captions:', error.message);
    console.log('\nFor more debugging information:');
    console.log(error);
  }
}

// Parse YouTube caption XML
function parseCaptionXml(xml) {
  const segments = [];
  const regex = /<text start="([\d.]+)" dur="([\d.]+)".*?>([\s\S]*?)<\/text>/g;
  
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const startTime = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const text = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, ''); // Remove any XML tags within the text
    
    segments.push({
      text,
      offset: startTime * 1000, // Convert to milliseconds
      duration: duration * 1000 // Convert to milliseconds
    });
  }
  
  return segments;
}

// Format time in milliseconds to MM:SS format
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Handle command line arguments
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cli.js <YouTube_URL> [output_file]');
    console.log('Example: node cli.js https://www.youtube.com/watch?v=dQw4w9WgXcQ captions.txt');
    console.log('\nNote: This tool automatically uses your Windows system proxy settings if configured.');
    return;
  }
  
  const videoUrl = args[0];
  const outputFile = args[1] || null;
  
  getCaptions(videoUrl, outputFile);
}

// Execute if this file is run directly
if (require.main === module) {
  main();
}

module.exports = { getCaptions, extractVideoId }; 