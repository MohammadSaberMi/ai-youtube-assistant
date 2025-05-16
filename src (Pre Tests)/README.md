# YouTube Caption Extractor

A tool to extract captions from YouTube videos using yt-dlp.

## Features

- Extract captions from any YouTube video that has them enabled
- Web interface for easy usage
- Command-line tool for direct usage or scripting
- Save captions to a file or display them directly
- Automatic Windows system proxy detection
- **NEW**: Uses yt-dlp for more reliable caption extraction
- **NEW**: Support for cookies to access restricted videos
- **NEW**: Ask questions about video content using Google's Gemini AI API

## Installation

### Prerequisites

1. Install Node.js (14+ recommended)
2. [Install yt-dlp](https://github.com/yt-dlp/yt-dlp#installation) (required for caption extraction)

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-youtube-assistant.git
cd ai-youtube-assistant

# Install dependencies
npm install
```

## Usage

### Web Interface (New yt-dlp Version)

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`
3. Enter a YouTube URL, select language, and optionally upload a cookies file
4. Click "Get Captions"
5. Once captions are retrieved, you can ask questions about the video content using the Q&A feature

### Command Line (New yt-dlp Version)

You can use the CLI tool directly:

```bash
# Display captions in the console
npm run get-captions https://www.youtube.com/watch?v=VIDEO_ID

# With full options
npm run get-captions https://www.youtube.com/watch?v=VIDEO_ID output.txt cookies.txt en
```

### Legacy Version (Without yt-dlp)

You can still use the old version if you don't want to install yt-dlp:

```bash
# Start the old web interface
npm run start:old

# Use the old CLI
node src/cli.js https://www.youtube.com/watch?v=VIDEO_ID
```

## Cookies Usage

To access restricted videos, you can use a cookies.txt file. This is useful for:

1. Age-restricted videos
2. Videos accessible only to logged-in users
3. Private videos shared with your account

### How to Get Your Cookies

1. Install the [Get cookies.txt](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) Chrome extension
2. Log in to YouTube
3. Click the extension icon and export your cookies
4. Use this file with the application

## API Usage

You can also use the API endpoints directly:

```
POST /api/captions
Content-Type: multipart/form-data

Form data:
- videoUrl: "https://www.youtube.com/watch?v=VIDEO_ID"
- language: "en"
- cookiesFile: [file upload]
```

Response:
```json
{
  "videoId": "VIDEO_ID",
  "fullTranscript": "Complete text of the captions...",
  "segments": [
    {
      "text": "Caption segment 1",
      "startTime": 0,
      "endTime": 5000,
      "duration": 5000
    },
    ...
  ]
}
```

## Gemini Q&A Feature

The application now supports asking questions about video content using Google's Gemini AI API:

1. To use this feature, you need to obtain a Gemini API key from the [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add your API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. After retrieving video captions, enter your question in the question box and click "Ask Question"
4. The AI will analyze the captions and provide relevant answers based on the video content

### Q&A API Usage

You can also use the Q&A API endpoint directly:

```
POST /api/ask
Content-Type: application/json

{
  "captions": "Full transcript text here...",
  "question": "Your question about the video"
}
```

Response:
```json
{
  "answer": "AI-generated answer based on the captions and question"
}
```

### Gemini Model Configuration

By default, the application uses the `gemini-2.0-flash` model. You can change this by setting the `GEMINI_MODEL` environment variable in your `.env` file:

```
GEMINI_MODEL=gemini-2.0-pro
```

## How it Works

This tool uses `yt-dlp` (a powerful YouTube downloader) to extract captions from YouTube videos. yt-dlp handles all the complexity of:

1. Getting video metadata
2. Finding available caption tracks
3. Downloading captions in various formats
4. Working with cookies for restricted videos

The application then parses the VTT format captions into a structured JSON format for easy use.

## Troubleshooting

### yt-dlp Not Found

If you see an error about yt-dlp not being found:

1. Make sure yt-dlp is installed correctly
2. Make sure it's available in your system PATH
3. Try running `yt-dlp --version` in your terminal to verify it works

### Connection Issues

If you're still experiencing connection issues:

1. **Check your internet connection**
   Make sure you have a stable internet connection.

2. **Configure Windows system proxy**
   The application automatically uses your Windows proxy settings. Make sure they are properly configured in Windows Settings > Network & Internet > Proxy.

3. **Try using cookies file**
   If the video is restricted, upload a cookies.txt file with your YouTube login information.

## Requirements

- Node.js 14+
- yt-dlp installed and in your PATH
- Internet connection to fetch captions from YouTube

## License

MIT 