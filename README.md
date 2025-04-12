# YouTube Subtitle AI Extension

## Introduction

This browser extension allows you to extract subtitles from YouTube videos and analyze them using AI.

## Features

- Automatically extracts subtitles from YouTube videos
- Sends subtitle text to an AI model for processing
- Enables users to ask questions based on subtitle content

## Team Members

| Full Name              | Role in the Scrum Team | GitHub/GitLab Account                        |
| ---------------------- | ---------------------- | -------------------------------------------- |
| Mohammad Saber Mirzaei | Developer              | [GitHub](https://github.com/MohammadSaberMi) |
| Mohammad Hossein Asadi | Scrum Master           | [GitHub](https://github.com/IRI-MH-Asadi)    |
| Amir Mohammad Soltani  | Developer              | [GitHub](https://github.com/)                |
| Amir Mahdi Abdoli      | Product Owner          | [GitHub](https://github.com/AmirMahdiAbdoli) |

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/MohammadSaberMi/ai-youtube-assistant.git
   ```
2. Open your browser and go to `chrome://extensions/`.
3. Enable `Developer mode`.
4. Click `Load unpacked` and select the repository folder.

## Usage

1. Open a YouTube video.
2. Click on the extension icon to extract subtitles.
3. Enter your question and get an AI-generated response.

## Configuration

To use AI capabilities, you need an API key from a supported AI provider (e.g., OpenAI, Google AI):

1. Get an API key.
2. Open the `config.js` file.
3. Add your API key:
   ```js
   const API_KEY = 'your-api-key-here';
   ```
4. Save the file and reload the extension.
