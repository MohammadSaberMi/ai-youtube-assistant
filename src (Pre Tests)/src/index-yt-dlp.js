const dotenv = require('dotenv');
dotenv.config(); // Load environment variables first!

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { getYoutubeCaptions, findYtDlpPath } = require('./yt-dlp-captions');
const { getLLMResponse, getAvailableModels } = require('./llm-api');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Setup file uploads for cookies file
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 50 * 1024 } // 50KB max size for cookie files
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Check yt-dlp on startup
let ytDlpPath = null;
findYtDlpPath().then(path => {
  ytDlpPath = path;
  console.log(`Found yt-dlp at: ${ytDlpPath}`);
}).catch(err => {
  console.error('Warning: yt-dlp not found in PATH. Captions will not work.');
  console.error(err.message);
});

// Get captions for a YouTube video
app.post('/api/captions', upload.single('cookiesFile'), async (req, res) => {
  try {
    const { videoUrl, language } = req.body;
    const cookiesFile = req.file ? req.file.path : null;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Check if yt-dlp was found
    if (!ytDlpPath) {
      try {
        ytDlpPath = await findYtDlpPath();
      } catch (error) {
        return res.status(500).json({ 
          error: `yt-dlp is not installed or not found in PATH. 
Please either:
1. Install yt-dlp: https://github.com/yt-dlp/yt-dlp#installation
2. Add your Python Scripts directory to your PATH
3. Set the YT_DLP_PATH environment variable to the location of yt-dlp.exe` 
        });
      }
    }
    
    // Get captions using yt-dlp
    const captionsData = await getYoutubeCaptions(videoUrl, {
      cookiesFile,
      lang: language || 'en',
      outputDir: uploadsDir,
      deleteSubtitleFile: true
    });
    
    // Clean up the cookies file if it was uploaded
    if (cookiesFile && fs.existsSync(cookiesFile)) {
      fs.unlink(cookiesFile, (err) => {
        if (err) console.error(`Error deleting cookies file: ${err.message}`);
      });
    }
    
    return res.json({
      videoId,
      fullTranscript: captionsData.fullTranscript,
      segments: captionsData.segments
    });
  } catch (error) {
    console.error('Error in caption processing:', error);
    return res.status(500).json({ error: `Failed to process captions: ${error.message}` });
  }
});

// API endpoint for asking questions about captions
app.post('/api/ask', async (req, res) => {
  try {
    const { captions, question, model } = req.body;
    
    if (!captions || !question || !model) {
      return res.status(400).json({ error: 'Captions, question, and model are required' });
    }
    
    // Check if OpenRouter API key is configured
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.' });
    }
    
    // Call the backend function for LLM API
    const answer = await getLLMResponse(question, captions, model);
        
    return res.json({ answer });
  } catch (error) {
    console.error('Error in LLM API processing:', error);
    return res.status(500).json({ error: error.message || 'Failed to process with LLM API' });
  }
});

// Simple HTML form for testing
app.get('/', async (req, res) => {
  const isLLMConfigured = !!OPENROUTER_API_KEY;
  let availableModels = [];
  let modelFetchError = null;

  if (isLLMConfigured) {
    try {
      // Fetch models only if API key is configured
      availableModels = await getAvailableModels(); 
    } catch (error) {
      console.error("Failed to fetch models for frontend:", error);
      modelFetchError = "Could not fetch model list from OpenRouter.";
      // Keep availableModels as []
    }
  }

  // Filter for free models for the dropdown (adjust filter as needed)
  const freeModels = availableModels
      .filter(model => model.id.includes(':free'))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Sort alphabetically by name

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Caption Extractor with Q&A (yt-dlp)</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        form { margin-bottom: 20px; }
        input[type="text"] { width: 70%; padding: 8px; }
        button { padding: 8px 16px; background: #ff0000; color: white; border: none; cursor: pointer; }
        pre { background: #f4f4f4; padding: 15px; overflow-x: auto; }
        .hidden { display: none; }
        .info { background: #e7f3fe; border-left: 6px solid #2196F3; padding: 10px; margin-bottom: 15px; }
        .warning { background: #fffacd; border-left: 6px solid #ffcc00; padding: 10px; margin-bottom: 15px; }
        .instructions { background: #ffffcc; border-left: 6px solid #ffeb3b; padding: 10px; margin-bottom: 15px; }
        label { display: block; margin: 10px 0 5px; }
        select, input[type="file"] { margin-bottom: 10px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        #questionForm { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        .response { background: #f0f8ff; padding: 15px; border-left: 6px solid #4682B4; margin-top: 15px; }
        select { margin-bottom: 10px; padding: 8px; }
      </style>
    </head>
    <body>
      <h1>YouTube Caption Extractor with Q&A (yt-dlp)</h1>
      <div class="info">
        <p><strong>Note:</strong> This application uses yt-dlp to download captions from YouTube videos and OpenRouter API to answer questions about them.</p>
      </div>
      ${!ytDlpPath ? `
      <div class="warning">
        <p><strong>Warning:</strong> yt-dlp was not found on your system!</p>
        <p>Please do one of the following:</p>
        <ol>
          <li>Add <code>C:\\Users\\${process.env.USERNAME || 'YourUsername'}\\AppData\\Roaming\\Python\\Python313\\Scripts</code> to your PATH</li>
          <li>Set the <code>YT_DLP_PATH</code> environment variable to the full path to yt-dlp.exe</li>
          <li><a href="https://github.com/yt-dlp/yt-dlp#installation" target="_blank">Install yt-dlp</a> again and make sure it's in your PATH</li>
        </ol>
      </div>
      ` : ''}
      ${!isLLMConfigured ? `
      <div class="warning">
        <p><strong>Warning:</strong> OpenRouter API key is not configured!</p>
        <p>Please set the OPENROUTER_API_KEY environment variable to enable the Q&A functionality.</p>
      </div>
      ` : ''}
      ${modelFetchError ? `<div class="warning"><p><strong>Warning:</strong> ${modelFetchError}</p></div>` : ''}
      <div class="instructions">
        <p><strong>Requirements:</strong></p>
        <ol>
          <li>yt-dlp must be installed on your system. <a href="https://github.com/yt-dlp/yt-dlp#installation" target="_blank">Installation instructions</a></li>
          <li>For access to restricted videos, you can upload a cookies.txt file (optional)</li>
          <li>For Q&A functionality, an OpenRouter API key must be configured</li>
        </ol>
      </div>
      <form id="captionForm" enctype="multipart/form-data">
        <label for="videoUrl">YouTube Video URL:</label>
        <input type="text" id="videoUrl" name="videoUrl" placeholder="Enter YouTube video URL" required>
        
        <label for="language">Caption Language:</label>
        <select id="language" name="language">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
          <option value="ar">Arabic</option>
          <option value="fa">Persian/Farsi</option>
        </select>
        
        <label for="cookiesFile">Cookies File (Optional):</label>
        <input type="file" id="cookiesFile" name="cookiesFile">
        
        <button type="submit">Get Captions</button>
      </form>
      <div id="results" class="hidden">
        <h2>Captions:</h2>
        <pre id="captions"></pre>
        
        <div id="questionForm" ${!isLLMConfigured ? 'class="hidden"' : ''}>
          <h2>Ask a Question:</h2>
          <p>Use an AI model via OpenRouter to ask questions about the video content based on the captions.</p>
          
          <label for="modelSelect">Select Model:</label>
          <select id="modelSelect" ${freeModels.length === 0 ? 'disabled' : ''}>
            ${freeModels.length > 0 
              ? freeModels.map(model => `<option value="${model.id}">${model.name} (ID: ${model.id})</option>`).join('\n')
              : '<option value="">-- No free models found --</option>'}
          </select>
          
          <input type="text" id="question" placeholder="Enter your question about the video" style="width: 80%;" ${freeModels.length === 0 ? 'disabled' : ''}>
          <button id="askButton" ${freeModels.length === 0 ? 'disabled' : ''}>Ask Question</button>
          
          <div id="answerContainer" class="hidden">
            <h3>Answer:</h3>
            <div id="answer" class="response"></div>
          </div>
        </div>
      </div>
      
      <script>
        let currentCaptions = '';
        const isLLMConfigured = ${isLLMConfigured};
        
        document.getElementById('captionForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const resultsDiv = document.getElementById('results');
          const captionsContainer = document.getElementById('captions');
          
          try {
            resultsDiv.classList.add('hidden');
            captionsContainer.textContent = 'Loading...';
            
            const formData = new FormData(e.target);
            
            const response = await fetch('/api/captions', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
              currentCaptions = data.fullTranscript;
              captionsContainer.textContent = currentCaptions;
              resultsDiv.classList.remove('hidden');
              
              // Show the question form if LLM API is configured
              if (isLLMConfigured) {
                document.getElementById('questionForm').classList.remove('hidden');
              }
            } else {
              alert('Error: ' + data.error);
            }
          } catch (error) {
            alert('Failed to fetch captions: ' + error.message);
          }
        });
        
        // Handle asking questions
        document.getElementById('askButton').addEventListener('click', async () => {
          const question = document.getElementById('question').value.trim();
          const selectedModel = document.getElementById('modelSelect').value;
          const answerContainer = document.getElementById('answerContainer');
          const answerDiv = document.getElementById('answer');
          
          if (!question) { alert('Please enter a question'); return; }
          if (!currentCaptions) { alert('Please fetch video captions first'); return; }
          if (!selectedModel) { alert('Please select a model'); return; }
          
          try {
            answerDiv.textContent = 'Thinking...';
            answerContainer.classList.remove('hidden');
            
            const response = await fetch('/api/ask', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                captions: currentCaptions,
                question: question,
                model: selectedModel
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              answerDiv.textContent = data.answer;
            } else {
              answerDiv.textContent = 'Error: ' + data.error;
            }
          } catch (error) {
            answerDiv.textContent = 'Failed to get answer: ' + error.message;
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
  if (ytDlpPath) {
    console.log(`Using yt-dlp from: ${ytDlpPath}`);
  } else {
    console.log(`Warning: yt-dlp not found in PATH. Captions will not work.`);
  }
}); 