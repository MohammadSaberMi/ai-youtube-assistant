// content_script.js
(() => {
  console.log("YouTube AI Assistant content script loaded (v2 - dynamic placement).");

  let videoTranscript = "";
  let captionsLoaded = false;
  let chatContainer; // The main chatbox div
  let chatHistoryContainer;
  let loadCaptionsButton;
  let chatInput;
  let sendButton;
  let viewModeObserver = null; // For MutationObserver

  // Function to determine current YouTube view mode
  function getCurrentViewMode() {
    const flexyElement = document.querySelector('ytd-watch-flexy');
    if (flexyElement && (flexyElement.hasAttribute('theater') || flexyElement.hasAttribute('fullscreen'))) {
      return 'theater'; // Treat fullscreen similar to theater for placement
    }
    return 'default';
  }

  // Function to create or get the chat UI elements
  function ensureChatUIElements() {
    if (chatContainer) return; // Already created

    chatContainer = document.createElement('div');
    chatContainer.id = 'youtube-ai-chat-container';

    const header = document.createElement('div');
    header.id = 'youtube-ai-chat-header';
    header.textContent = 'Video AI Assistant';
    chatContainer.appendChild(header);

    chatHistoryContainer = document.createElement('div');
    chatHistoryContainer.id = 'youtube-ai-chat-history';
    chatContainer.appendChild(chatHistoryContainer);

    const inputArea = document.createElement('div');
    inputArea.id = 'youtube-ai-chat-input-area';

    chatInput = document.createElement('input');
    chatInput.id = 'youtube-ai-chat-input';
    chatInput.type = 'text';
    chatInput.placeholder = 'Ask about the video...';
    inputArea.appendChild(chatInput);

    sendButton = document.createElement('button');
    sendButton.id = 'youtube-ai-chat-send-button';
    sendButton.textContent = 'Send';
    inputArea.appendChild(sendButton);
    
    loadCaptionsButton = document.createElement('button');
    loadCaptionsButton.id = 'youtube-ai-load-captions-button';
    loadCaptionsButton.textContent = 'Load Captions';
    inputArea.appendChild(loadCaptionsButton);

    chatContainer.appendChild(inputArea);

    // Add event listeners
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSendMessage();
    });
    loadCaptionsButton.addEventListener('click', fetchAndProcessCaptions);

    addMessageToChat("AI", "Hello! Click 'Load Captions' then ask me about the video.", "ai", true);
  }

  // Function to inject the chat UI into the correct DOM location
  function injectChatUI() {
    ensureChatUIElements(); // Create elements if they don't exist

    const viewMode = getCurrentViewMode();
    let parentElement = null;
    let insertBeforeElement = null;

    console.log(`Attempting to inject chat UI in ${viewMode} mode.`);

    if (viewMode === 'theater') {
      // Theater mode: inject below player, above comments/description section
      parentElement = document.querySelector('div#primary-inner'); // Primary content column
      if (parentElement) {
        // Try to insert before comments, or after metadata
        insertBeforeElement = parentElement.querySelector('ytd-comments#comments');
        if (!insertBeforeElement) {
            // Fallback: try to insert after ytd-watch-metadata or similar central column content
            const metadataElement = parentElement.querySelector('ytd-watch-metadata') || parentElement.querySelector('#description') || parentElement.querySelector('#info');
            if (metadataElement && metadataElement.nextSibling) {
                insertBeforeElement = metadataElement.nextSibling;
            } else if (metadataElement) {
                // if metadata is the last thing, append after it
                 // This case is less ideal, better to find a specific insertion point
            }
        }
        // If still no specific insertBefore, it will append to parentElement (which is primary-inner)
      } else {
        console.warn('Could not find #primary-inner for theater mode placement.');
      }
    } else {
      // Default view: inject into the sidebar (secondary column)
      parentElement = document.querySelector('div#secondary-inner');
      if (parentElement) {
        insertBeforeElement = parentElement.firstChild; // Insert at the top of related videos
      } else {
        console.warn('Could not find #secondary-inner for default mode placement.');
      }
    }

    if (parentElement && chatContainer) {
      if (insertBeforeElement) {
        parentElement.insertBefore(chatContainer, insertBeforeElement);
        console.log('Chat UI injected before element:', insertBeforeElement);
      } else {
        parentElement.appendChild(chatContainer); // Fallback to appending
        console.log('Chat UI appended to parent:', parentElement);
      }
      // Ensure chatbox is visible if it was hidden
      chatContainer.style.display = 'flex';
    } else if (chatContainer) {
      // Fallback if specific parent not found, hide it or use old fixed position
      console.warn('Could not find a suitable parent element for chat UI. Hiding chatbox.');
      chatContainer.style.display = 'none'; // Hide if it can't be placed
    }
  }


  function addMessageToChat(sender, message, type = 'info', isInitial = false) {
    if (!chatHistoryContainer) {
        // If called before UI fully ready, queue it? For now, just log.
        console.log("Chat history not ready for message:", sender, message);
        return;
    }
    if (!isInitial && chatHistoryContainer.firstChild && chatHistoryContainer.firstChild.classList.contains('initial-greeting')) {
        chatHistoryContainer.innerHTML = ''; // Clear initial greeting
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('youtube-ai-chat-message', type);
    if (sender === "AI" && message === "Hello! Click 'Load Captions' then ask me about the video.") {
        messageDiv.classList.add('initial-greeting');
    }

    // Sanitize message text to prevent basic HTML injection from transcript/AI
    const textNode = document.createTextNode(`${sender}: ${message}`);
    messageDiv.appendChild(textNode);
    
    chatHistoryContainer.appendChild(messageDiv);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
  }
  
  function addInfoMessage(message) { addMessageToChat("System", message, "info"); }
  function addErrorMessage(message) { addMessageToChat("Error", message, "error"); }

  async function fetchAndProcessCaptions() {
    if (captionsLoaded) {
      addInfoMessage("Captions already loaded.");
      return true;
    }
    addInfoMessage("Loading captions...");
    if(loadCaptionsButton) {
        loadCaptionsButton.disabled = true;
        loadCaptionsButton.textContent = 'Loading...';
    }

    const scripts = Array.from(document.scripts);
    let playerJson = null;
    for (let s of scripts) {
      const txt = s.textContent;
      if (txt && txt.includes('ytInitialPlayerResponse')) {
        const match = txt.match(/ytInitialPlayerResponse\s*=\s*(\{.*\});\s*var/s) || txt.match(/ytInitialPlayerResponse\s*=\s*(\{.*?});/s);
        if (match && match[1]) {
          try {
            playerJson = JSON.parse(match[1]);
            break;
          } catch (e) {
            console.error('Failed to parse ytInitialPlayerResponse JSON:', e, "\nMatch:", match[1].substring(0,500));
            addErrorMessage(`Failed to parse player data: ${e.message}`);
            resetLoadButton();
            return false;
          }
        }
      }
    }

    if (!playerJson) {
      addErrorMessage('No ytInitialPlayerResponse found. Try refreshing the video page.');
      resetLoadButton();
      return false;
    }

    const tracks = playerJson.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (!tracks.length) {
      addErrorMessage('No captions available for this video.');
      resetLoadButton();
      return false;
    }

    const preferredLangCode = 'en';
    let track = tracks.find(t => t.languageCode === preferredLangCode) ||
                tracks.find(t => t.languageCode.startsWith(preferredLangCode.substring(0,2))) ||
                tracks[0];

    addInfoMessage(`Using captions: ${track.name?.simpleText || 'Unknown'} [${track.languageCode}]`);

    try {
      const res = await fetch(track.baseUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const xml = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
          console.error("XML Parsing Error:", parserError.textContent);
          throw new Error("Failed to parse caption XML.");
      }

      const lines = Array.from(doc.querySelectorAll('text'))
        .map(n => n.textContent.trim().replace(/\s+/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'))
        .filter(Boolean);
      
      videoTranscript = lines.join(' ');
      captionsLoaded = true;
      addInfoMessage(`Captions loaded (${lines.length} lines). Ready for questions!`);
      console.log(`📝 Transcript (${track.languageCode}):\n`, videoTranscript.substring(0, 200) + "...");
      if(loadCaptionsButton){
          loadCaptionsButton.textContent = 'Captions Loaded';
          loadCaptionsButton.disabled = true;
      }
      return true;
    } catch (e) {
      addErrorMessage(`Failed to fetch/process captions: ${e.message}`);
      console.warn('Failed to fetch/process captions:', e);
      resetLoadButton();
      return false;
    }
  }
  
  function resetLoadButton() {
    if (loadCaptionsButton) {
      loadCaptionsButton.disabled = false;
      loadCaptionsButton.textContent = 'Load Captions';
    }
  }

  async function getAIResponse(userQuery, context) {
    addMessageToChat("AI", "Thinking...", "ai");
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!context) {
      return "I don't have the video transcript yet. Please load captions first.";
    }
    let response = `You asked: "${userQuery}". `;
    const queryWords = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2); // Get meaningful words
    let foundMatch = false;
    for (const word of queryWords) {
        if (context.toLowerCase().includes(word)) {
            foundMatch = true;
            break;
        }
    }
    if (foundMatch) {
        response += `The video transcript seems related. For example: "...${context.substring(0, Math.min(context.length, 100))}..."`;
    } else {
        response += `I couldn't directly find strong connections to "${userQuery}" in the initial part of the transcript, but the video is about various topics. The transcript starts: "...${context.substring(0, Math.min(context.length, 80))}..."`;
    }
    return response;
  }

  async function handleSendMessage() {
    if (!chatInput) return;
    const query = chatInput.value.trim();
    if (!query) return;

    addMessageToChat("You", query, "user");
    chatInput.value = '';

    if (!captionsLoaded) {
      addErrorMessage("Captions not loaded. Click 'Load Captions' or try again if loading failed.");
      return;
    }

    const aiResponse = await getAIResponse(query, videoTranscript);
    addMessageToChat("AI", aiResponse, "ai");
  }
  
  // Function to reset chat state for new video
  function resetForNewVideo() {
    console.log("YouTube navigation or mode change detected. Resetting AI Assistant state.");
    videoTranscript = "";
    captionsLoaded = false;
    if (chatHistoryContainer) {
        chatHistoryContainer.innerHTML = ''; // Clear old messages
         addMessageToChat("AI", "Navigated or mode changed. Click 'Load Captions' for the current video content.", "ai", true);
    }
    resetLoadButton();
    // Re-inject UI to ensure correct placement
    if (chatContainer) { // Only if UI was initialized
        injectChatUI();
    }
  }

  // Observer for view mode changes
  function observeViewModeChanges() {
    const flexyElement = document.querySelector('ytd-watch-flexy');
    if (!flexyElement) {
      console.warn("ytd-watch-flexy not found for observer setup.");
      return;
    }

    if (viewModeObserver) viewModeObserver.disconnect(); // Disconnect previous if any

    viewModeObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'theater' || mutation.attributeName === 'fullscreen')) {
          console.log('View mode attribute changed:', mutation.attributeName);
          // Delay slightly to allow YouTube to settle its layout
          setTimeout(resetForNewVideo, 200); 
          break; 
        }
      }
    });

    viewModeObserver.observe(flexyElement, { attributes: true });
    console.log("View mode observer attached to ytd-watch-flexy.");
  }

  // Initialize
  function initialize() {
    ensureChatUIElements(); // Create the chatbox elements
    injectChatUI();         // Place them in the DOM
    observeViewModeChanges(); // Start observing for theater/default mode changes

    // Listen for YouTube SPA navigation events
    document.addEventListener('yt-navigate-finish', () => {
        // Delay slightly as player response might not be updated instantly
        setTimeout(() => {
            resetForNewVideo();
            // Re-observe in case ytd-watch-flexy was replaced (less likely but possible)
            observeViewModeChanges();
        }, 500);
    });
  }

  // Wait for the relevant parts of the page to be ready
  // YouTube pages can be very dynamic. `ytd-watch-flexy` is a good indicator.
  const YOUTUBE_APP_READY_INTERVAL = 100;
  const MAX_ATTEMPTS = 50; // Try for 5 seconds
  let attempts = 0;

  function checkPageReady() {
    if (document.querySelector('ytd-watch-flexy div#secondary-inner') || document.querySelector('ytd-watch-flexy div#primary-inner')) {
      console.log("YouTube watch page elements detected. Initializing AI Assistant.");
      initialize();
    } else {
      attempts++;
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(checkPageReady, YOUTUBE_APP_READY_INTERVAL);
      } else {
        console.warn("YouTube AI Assistant: Could not find expected page elements after multiple attempts.");
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPageReady);
  } else {
    checkPageReady();
  }

})();