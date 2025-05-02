const express = require('express');
const YouTube = require('youtube-sr').default;
const ytdl = require('ytdl-core');
const dotenv = require('dotenv');
const { fetchWithRetry } = require('./proxy-util');
const { getGeminiResponse } = require('./gemini-api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Get captions for a YouTube video
app.post('/api/captions', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Get video info
    console.log(`Fetching video info for ID: ${videoId}`);
    const videoInfo = await ytdl.getInfo(videoId);
    
    // Get caption tracks
    const captionTracks = videoInfo.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      return res.status(404).json({ error: 'No captions found for this video' });
    }
    
    // Get the first available caption track (usually English)
    // You could also filter by language code (e.g., 'en')
    const captionTrack = captionTracks[0];
    
    // Fetch the captions XML
    const captionUrl = captionTrack.baseUrl;
    console.log(`Fetching captions from: ${captionUrl}`);
    
    try {
      // Use fetchWithRetry from proxy-util which now supports Windows system proxy
      const captionResponse = await fetchWithRetry(captionUrl, {}, 3, 300, true);
      const captionXml = await captionResponse.text();
      
      // Parse XML to extract text
      const captionSegments = parseCaptionXml(captionXml);
      const fullTranscript = captionSegments.map(segment => segment.text).join(' ');
      
      return res.json({
        videoId,
        fullTranscript,
        segments: captionSegments
      });
    } catch (fetchError) {
      console.error('Error fetching captions:', fetchError);
      if (fetchError.code === 'ETIMEDOUT' || fetchError.code === 'ECONNREFUSED' || fetchError.type === 'request-timeout') {
        return res.status(503).json({ 
          error: 'Network timeout while fetching captions. The app is now using your Windows system proxy settings if available.'
        });
      }
      return res.status(500).json({ error: `Failed to fetch captions: ${fetchError.message}` });
    }
  } catch (error) {
    console.error('Error in caption processing:', error);
    return res.status(500).json({ error: `Failed to process captions: ${error.message}` });
  }
});

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

// Ask question about video captions
app.post('/api/ask', async (req, res) => {
  try {
    const { question, caption } = req.body;
    
    if (!question || !caption) {
      return res.status(400).json({ error: 'Question and caption are required' });
    }
    
    const response = await getGeminiResponse(question, caption);
    
    return res.json({
      answer: response
    });
  } catch (error) {
    console.error('Error in question processing:', error);
    return res.status(500).json({ error: `Failed to process question: ${error.message}` });
  }
});

// Simple HTML form for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Caption Extractor</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        form { margin-bottom: 20px; }
        input[type="text"] { width: 70%; padding: 8px; }
        button { padding: 8px 16px; background: #ff0000; color: white; border: none; cursor: pointer; }
        pre { background: #f4f4f4; padding: 15px; overflow-x: auto; }
        .hidden { display: none; }
        .info { background: #e7f3fe; border-left: 6px solid #2196F3; padding: 10px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <h1>YouTube Caption Extractor</h1>
      <div class="info">
        <p><strong>Note:</strong> This application is using your Windows system proxy settings automatically if configured.</p>
      </div>
      <form id="captionForm">
        <input type="text" id="videoUrl" placeholder="Enter YouTube video URL" required>
        <button type="submit">Get Captions</button>
      </form>
      <div id="results" class="hidden">
        <h2>Captions:</h2>
        <pre id="captions"></pre>
      </div>
      
      <script>
        document.getElementById('captionForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const videoUrl = document.getElementById('videoUrl').value;
          const resultsDiv = document.getElementById('results');
          const captionsContainer = document.getElementById('captions');
          
          try {
            resultsDiv.classList.add('hidden');
            captionsContainer.textContent = 'Loading...';
            
            const response = await fetch('/api/captions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrl })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              captionsContainer.textContent = data.fullTranscript;
              resultsDiv.classList.remove('hidden');
            } else {
              alert('Error: ' + data.error);
            }
          } catch (error) {
            alert('Failed to fetch captions: ' + error.message);
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to use the application`);
  console.log(`Using Windows system proxy settings if configured`);
}); 