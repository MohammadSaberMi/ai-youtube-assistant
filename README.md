# ai-youtube-assistant

# YouTube Subtitle AI Extension

## Introduction
This browser extension extracts subtitles from YouTube videos and allows users to ask questions based on the subtitle content using AI APIs.

## Features
- Extracts subtitles from YouTube videos in real-time.
- Sends extracted text to an AI API for question-answering.
- Displays AI-generated responses directly in the extension.
- Supports multiple languages.

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/your-username/youtube-ai-extension.git
   ```
2. Open your browser and navigate to `chrome://extensions/`.
3. Enable `Developer mode` (toggle on the top right corner).
4. Click on `Load unpacked` and select the cloned repository folder.

## Usage

1. Open a YouTube video with subtitles.
2. Click on the extension icon to extract subtitles.
3. Type your question in the input box.
4. Press enter and wait for the AI-generated response.

## Configuration
To use AI capabilities, you need an API key from a supported AI provider (e.g., OpenAI, Google AI):

1. Get an API key from your preferred AI provider.
2. Open the `config.js` file in the project root.
3. Add your API key:
   ```js
   const API_KEY = "your-api-key-here";
   ```
4. Save the file and reload the extension.

## Development

### Prerequisites
- Node.js (for testing API interactions)
- Basic knowledge of JavaScript, HTML, and Chrome Extensions

### Folder Structure
```
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── styles.css
└── config.js
```

### How It Works
1. `content.js`: Injects a script into YouTube pages to extract subtitles.
2. `popup.js`: Handles UI interactions and API requests.
3. `background.js`: Manages extension events and storage.
4. `manifest.json`: Defines extension metadata and permissions.

## Contribution
Feel free to submit issues or pull requests if you find bugs or want to improve the extension.

## License
This project is licensed under the MIT License.

---

### Contact
For any questions, please reach out via GitHub issues or email at `your-email@example.com`.

