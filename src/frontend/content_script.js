(() => {
  console.log('YouTube AI Assistant content script loaded.');

  const chatUIHTML = `
  <div id="youtube-ai-chat-container" class="youtube-ai-chat-container">
    <div id="youtube-ai-chat-header" class="youtube-ai-chat-header">
      Video AI Assistant
      <div class="tab-nav">
        <button data-tab="chat" class="tab-button icon-button active" title="Chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="#4b5563"/>
          </svg>
        </button>
        <button data-tab="settings" class="tab-button icon-button" title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.55 9.37C21.74 9.23 21.82 8.99 21.74 8.78L19.44 4.17C19.36 3.96 19.14 3.88 18.93 3.96L16.11 5.26C15.67 4.91 15.19 4.62 14.67 4.39L14.34 1.41C14.31 1.18 14.13 1 13.9 1H10.1C9.87 1 9.69 1.18 9.66 1.41L9.33 4.39C8.81 4.62 8.33 4.91 7.89 5.26L5.07 3.96C4.86 3.88 4.64 3.96 4.56 4.17L2.26 8.78C2.18 8.99 2.26 9.23 2.45 9.37L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.45 14.63C2.26 14.77 2.18 15.01 2.26 15.22L4.56 19.83C4.64 20.04 4.86 20.12 5.07 20.04L7.89 18.74C8.33 19.09 8.81 19.38 9.33 19.61L9.66 22.59C9.69 22.82 9.87 23 10.1 23H13.9C14.13 23 14.31 22.82 14.34 22.59L14.67 19.61C15.19 19.38 15.67 19.09 16.11 18.74L18.93 20.04C19.14 20.12 19.36 20.04 19.44 19.83L21.74 15.22C21.82 15.01 21.74 14.77 21.55 14.63L19.14 12.94Z" fill="#4b5563"/>
          </svg>
        </button>
        <button data-tab="history" class="tab-button icon-button" title="History">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L8.78 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="#4b5563"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="youtube-ai-login-container">
      <input placeholder="Username" class="input-field login-input" />
      <input type="password" placeholder="Password" class="input-field login-input" />
      <button class="button auth-button blue-gradient">Login</button>
      <button class="button auth-button green-gradient signup-button-spacing">Signup</button>
    </div>
    <div id="youtube-ai-tabs-content" class="tab-content">
      <div id="tab-chat" class="tab-pane active">
        <div id="youtube-ai-chat-history" class="chat-history"></div>
        <div id="youtube-ai-suggestions" class="suggestions-container hidden">
          <div id="youtube-ai-suggestions-list" class="suggestions-list"></div>
        </div>
        <div id="youtube-ai-chat-input-area" class="input-area">
          <input type="text" placeholder="Ask about the video..." class="input-field chat-input" />
          <button class="button chat-button blue-gradient">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.11933 4.38421C6.32524 2.98547 3.22434 5.63695 4.17515 8.61184L5.26247 12.0138L4.18106 15.3845C3.22719 18.3576 6.32366 21.0124 9.11924 19.6182L18.0461 15.1663C20.6491 13.8682 20.6519 10.1575 18.0509 8.85543L9.11933 4.38421Z" fill="#363853"/>
            </svg>
          </button>
          <button class="button chat-button green-gradient load-captions-spacing">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <g id="SVGRepo_bgCarrier" stroke-width="0"/>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
              <g id="SVGRepo_iconCarrier">
                <path d="M12 2C12.5523 2 13 2.44772 13 3L13 13.5858L16.2929 10.2929C16.6834 9.90237 17.3166 9.90237 17.7071 10.2929C18.0976 10.6834 18.0976 11.3166 17.7071 11.7071L12.7087 16.7055L12.6936 16.7204C12.5145 16.8929 12.2711 16.9992 12.003 17L12 17L11.997 17C11.8631 16.9996 11.7353 16.9729 11.6187 16.9247C11.5002 16.8759 11.3892 16.8034 11.2929 16.7071L6.29289 11.7071C5.90237 11.3166 5.90237 10.6834 6.29289 10.2929C6.68342 9.90237 7.31658 9.90237 7.70711 10.2929L11 13.5858L11 3C11 2.44772 11.4477 2 12 2Z" fill="#000000"/>
                <path d="M4 17C4 16.4477 3.55228 16 3 16C2.44772 16 2 16.4477 2 17V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V17C22 16.4477 21.5523 16 21 16C20.4477 16 20 16.4477 20 17V20H4V17Z" fill="#000000"/>
              </g>
            </svg>
          </button>
        </div>
      </div>
      <div id="tab-settings" class="tab-pane">
        <div id="youtube-ai-settings-container">
          <input placeholder="OpenRouter API Key" class="input-field chat-input" />
          <button class="button full-width purple-gradient">Set API Key</button>
          <select class="select-field">
            <option value="">Select a model</option>
          </select>
        </div>
      </div>
      <div id="tab-history" class="tab-pane">
        <div id="youtube-ai-full-history-display" class="history-display">
          <div class="history-loading">Loading history...</div>
          <div class="history-empty hidden">No chat history available.</div>
          <div class="history-content hidden"></div>
        </div>
      </div>
    </div>
  </div>
`;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(link);

  let videoTranscript = '';
  let captionsLoaded = false;
  let chatContainer;
  let chatHistoryContainer;
  let loadCaptionsButton;
  let chatInput;
  let sendButton;
  let loginContainer;
  let modelSelect;
  let apiKeyInput;
  let setApiKeyButton;
  let viewModeObserver = null;
  window.currentYouTubePageVideoId = null;

  let tabsContentContainer;
  let chatTabPane, settingsTabPane, historyTabPane;
  let fullHistoryDisplayContainer;

  const setCookie = (name, value, days) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Strict; Secure`;
  };

  const getCookie = (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
  };

  const getToken = () => getCookie('token');

  function getCurrentViewMode() {
    const flexyElement = document.querySelector('ytd-watch-flexy');
    if (flexyElement) {
      if (flexyElement.hasAttribute('theater') || flexyElement.hasAttribute('fullscreen')) {
        if (flexyElement.hasAttribute('fullscreen_')) return 'fullscreen_player';
        return 'theater';
      }
    }
    if (document.fullscreenElement && document.querySelector('.html5-video-player.ytp-fullscreen')) {
      return 'fullscreen_browser';
    }
    return 'default';
  }
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      addInfoMessage('Answer copied to clipboard!');
    }).catch(err => {
      addErrorMessage('Failed to copy answer: ' + err.message);
    });
  }
  function switchTab(tabName) {
    if (!tabsContentContainer) return;
    const tabButtons = chatContainer.querySelectorAll('.tab-button');
    const tabPanes = tabsContentContainer.querySelectorAll('.tab-pane');

    tabButtons.forEach((button) => {
      button.classList.remove('active');
    });
    tabPanes.forEach((pane) => {
      pane.classList.remove('active');
    });

    const selectedButton = Array.from(tabButtons).find((button) => button.dataset.tab === tabName);
    const selectedPane = document.getElementById(`tab-${tabName}`);
    if (selectedButton && selectedPane) {
      selectedButton.classList.add('active');
      selectedPane.classList.add('active');
    }
  }
  async function fetchRecommendedQuestions(videoId) {
    const token = getToken();
    if (!token || !videoId) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/recommended-questions/${videoId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        renderSuggestedQuestions(data.questions);
      } else {
        addErrorMessage('Failed to load suggested questions: ' + (data.error || 'No questions returned'));
        renderSuggestedQuestions([]);
      }
    } catch (error) {
      addErrorMessage('Error fetching suggested questions: ' + error.message);
      renderSuggestedQuestions([]);
    }
  }

  function renderSuggestedQuestions(questions) {
    const suggestionsContainer = document.querySelector('#youtube-ai-suggestions');
    const suggestionsList = document.querySelector('#youtube-ai-suggestions-list');

    if (!suggestionsContainer || !suggestionsList) return;

    suggestionsList.innerHTML = '';
    if (questions.length === 0) {
      suggestionsContainer.classList.add('hidden');
      return;
    }

    suggestionsContainer.classList.remove('hidden');
    questions.forEach(question => {
      const button = document.createElement('button');
      button.classList.add('button', 'suggestion-button', 'blue-gradient');
      button.textContent = question;
      button.style.minWidth = '120px'; // Ensure buttons have a minimum width for consistency
      button.addEventListener('click', () => {
        chatInput.value = question;
        chatInput.focus();
      });
      suggestionsList.appendChild(button);
    });
  }
  function ensureChatUIElements() {
    if (chatContainer) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = chatUIHTML;
    chatContainer = tempDiv.firstElementChild;
    document.body.appendChild(chatContainer);

    loginContainer = chatContainer.querySelector('#youtube-ai-login-container');
    tabsContentContainer = chatContainer.querySelector('#youtube-ai-tabs-content');
    chatTabPane = chatContainer.querySelector('#tab-chat');
    settingsTabPane = chatContainer.querySelector('#tab-settings');
    historyTabPane = chatContainer.querySelector('#tab-history');
    chatHistoryContainer = chatContainer.querySelector('#youtube-ai-chat-history');
    fullHistoryDisplayContainer = chatContainer.querySelector('#youtube-ai-full-history-display');
    chatInput = chatContainer.querySelector('#youtube-ai-chat-input-area .chat-input');
    sendButton = chatContainer.querySelector('#youtube-ai-chat-input-area .blue-gradient');
    loadCaptionsButton = chatContainer.querySelector('#youtube-ai-chat-input-area .green-gradient');
    apiKeyInput = chatContainer.querySelector('#youtube-ai-settings-container .chat-input');
    setApiKeyButton = chatContainer.querySelector('#youtube-ai-settings-container .purple-gradient');
    modelSelect = chatContainer.querySelector('#youtube-ai-settings-container .select-field');
    const suggestionsContainer = chatContainer.querySelector('#youtube-ai-suggestions');
    const suggestionsList = chatContainer.querySelector('#youtube-ai-suggestions-list');

    const savedApiKey = getCookie('userApiKey');
    if (savedApiKey) apiKeyInput.value = savedApiKey;

    loginContainer.querySelector('.blue-gradient').addEventListener('click', () => {
      const usernameInput = loginContainer.querySelector('input[placeholder="Username"]');
      const passwordInput = loginContainer.querySelector('input[placeholder="Password"]');
      login(usernameInput.value, passwordInput.value);
    });
    loginContainer.querySelector('.green-gradient').addEventListener('click', () => {
      const usernameInput = loginContainer.querySelector('input[placeholder="Username"]');
      const passwordInput = loginContainer.querySelector('input[placeholder="Password"]');
      signup(usernameInput.value, passwordInput.value);
    });
    setApiKeyButton.addEventListener('click', () => setApiKey(apiKeyInput.value));
    modelSelect.addEventListener('change', () => setModel(modelSelect.value));
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSendMessage());
    loadCaptionsButton.addEventListener('click', fetchAndProcessCaptions);

    chatContainer.querySelectorAll('.tab-button').forEach((button) => {
      button.addEventListener('click', () => {
        switchTab(button.dataset.tab);
        if (button.dataset.tab === 'history' && getToken()) {
          fetchUserChatHistory(window.currentYouTubeAIVideoId);
        }
      });
    });

    switchTab('chat');
    addMessageToChat('AI', 'Please login or signup to start.', 'ai', true);
  }

  function injectChatUI() {
    ensureChatUIElements();
    const viewMode = getCurrentViewMode();
    let parentElement;
    let insertBeforeElement = null;

    if (chatContainer.parentNode) {
      chatContainer.parentNode.removeChild(chatContainer);
    }

    if (viewMode.startsWith('fullscreen')) {
      console.log('YouTube AI Assistant: In fullscreen mode, UI will not be injected.');
      chatContainer.classList.remove('visible');
      return;
    }

    if (viewMode === 'theater') {
      parentElement = document.querySelector('ytd-watch-flexy #primary-inner');
      if (parentElement) {
        insertBeforeElement =
          parentElement.querySelector('#related') ||
          parentElement.querySelector('#comments') ||
          parentElement.querySelector('#below #actions');
      }
    } else {
      parentElement = document.querySelector('ytd-watch-flexy div#secondary-inner');
      if (parentElement) {
        insertBeforeElement = parentElement.firstChild;
      }
    }

    if (parentElement && chatContainer) {
      if (insertBeforeElement) {
        parentElement.insertBefore(chatContainer, insertBeforeElement);
      } else {
        parentElement.appendChild(chatContainer);
      }
      chatContainer.classList.add('visible');
    } else if (chatContainer) {
      chatContainer.classList.remove('visible');
      console.warn('YouTube AI Assistant: Could not find suitable parent to inject UI for view mode:', viewMode);
    }
  }

  function addMessageToChat(sender, message, type = 'info', isInitial = false) {
    if (!chatHistoryContainer) return;
    if (!isInitial && chatHistoryContainer.firstChild?.classList.contains('initial-greeting')) {
      chatHistoryContainer.innerHTML = '';
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `message-${type}`);
    if (isInitial) messageDiv.classList.add('initial-greeting');

    const senderStrong = document.createElement('strong');
    senderStrong.textContent = `${sender}: `;
    messageDiv.appendChild(senderStrong);
    const messageText = document.createElement('span');
    messageText.textContent = message;
    messageDiv.appendChild(messageText);

    if (type === 'ai' && !isInitial) {
      const copyButton = document.createElement('button');
      copyButton.classList.add('button', 'copy-button', 'blue-gradient');
      copyButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9ZM20 20H11V11H20V20ZM7 13H5C3.89543 13 3 12.1046 3 11V4C3 2.89543 3.89543 2 5 2H14C15.1046 2 16 2.89543 16 4V6H13V4H5V11H7V13Z" fill="#ffffff"/>
      </svg>
    `;
      copyButton.addEventListener('click', () => copyToClipboard(message));
      messageDiv.appendChild(copyButton);
    }

    chatHistoryContainer.appendChild(messageDiv);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
  }

  function addInfoMessage(message) {
    addMessageToChat('System', message, 'info');
  }

  function addErrorMessage(message) {
    alert('Error: ' + message);
    addMessageToChat('Error', message, 'error');
  }

  async function verifyToken() {
    const token = getToken();
    if (!token) return false;
    try {
      const response = await fetch('http://127.0.0.1:3000/api/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        loginContainer.classList.add('hidden');
        tabsContentContainer.classList.remove('hidden');
        fetchModels();
        if (window.currentYouTubeAIVideoId) fetchChatHistory(window.currentYouTubeAIVideoId);
        return true;
      } else {
        deleteCookie('token');
        loginContainer.classList.remove('hidden');
        tabsContentContainer.classList.add('hidden');
        return false;
      }
    } catch (error) {
      deleteCookie('token');
      loginContainer.classList.remove('hidden');
      tabsContentContainer.classList.add('hidden');
      return false;
    }
  }

  async function login(username, password) {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        setCookie('token', data.token, 7);
        addInfoMessage('Logged in successfully!');
        loginContainer.classList.add('hidden');
        tabsContentContainer.classList.remove('hidden');
        fetchModels();
        if (window.currentYouTubeAIVideoId) fetchChatHistory(window.currentYouTubeAIVideoId);
      } else {
        addErrorMessage('Login failed: ' + data.error);
        loginContainer.classList.remove('hidden');
        tabsContentContainer.classList.add('hidden');
      }
    } catch (error) {
      addErrorMessage('Login error: ' + error.message);
      loginContainer.classList.remove('hidden');
      tabsContentContainer.classList.add('hidden');
    }
  }

  async function signup(username, password) {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        addInfoMessage('Signed up successfully! Please login.');
      } else {
        addErrorMessage('Signup failed: ' + data.error);
      }
    } catch (error) {
      addErrorMessage('Signup error: ' + error.message);
    }
  }

  async function setApiKey(apiKey) {
    const token = getToken();
    if (!token) return addErrorMessage('Please login first.');
    try {
      const response = await fetch('http://127.0.0.1:3000/api/set-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey })
      });
      const data = await response.json();
      if (data.success) {
        addInfoMessage('API key set successfully.');
        setCookie('userApiKey', apiKey, 365);
        fetchModels();
      } else {
        addErrorMessage('Failed to set API key: ' + data.error);
      }
    } catch (error) {
      addErrorMessage('Error setting API key: ' + error.message);
    }
  }

  async function fetchModels() {
    const token = getToken();
    if (!token || !modelSelect) return;
    try {
      const response = await fetch('http://127.0.0.1:3000/api/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data.data)) {
        modelSelect.innerHTML = '<option value="">Select a model</option>';
        data.data.forEach((model) => {
          const option = document.createElement('option');
          option.value = model.id;
          option.textContent = model.name;
          modelSelect.appendChild(option);
        });
      } else if (data.error) {
        addErrorMessage('Models: ' + data.error);
        modelSelect.innerHTML = '<option value="">Failed to load</option>';
      } else {
        addErrorMessage('No models returned.');
        modelSelect.innerHTML = '<option value="">No models</option>';
      }
    } catch (error) {
      addErrorMessage('Error fetching models: ' + error.message);
      if (modelSelect) modelSelect.innerHTML = '<option value="">Error</option>';
    }
  }

  async function setModel(model) {
    const token = getToken();
    if (!token) return addErrorMessage('Please login first.');
    if (!model) return;
    try {
      const response = await fetch('http://127.0.0.1:3000/api/set-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ model })
      });
      const data = await response.json();
      if (data.success) {
        addInfoMessage('Model set successfully.');
      } else {
        addErrorMessage('Failed to set model: ' + data.error);
      }
    } catch (error) {
      addErrorMessage('Error setting model: ' + error.message);
    }
  }

  async function fetchChatHistory(videoId) {
    const token = getToken();
    if (!token || !chatHistoryContainer) return;

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/chat-history/${videoId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (chatHistoryContainer.firstChild?.classList.contains('initial-greeting')) {
        chatHistoryContainer.innerHTML = '';
      }
      if (data.history && data.history.length > 0) {
        data.history.forEach((msg) => {
          addMessageToChat(msg.sender === 'user' ? 'You' : 'AI', msg.message, msg.sender);
        });
      }
    } catch (error) {
      addErrorMessage('Error fetching chat history: ' + error.message);
    }
  }

  function renderChatHistory(history) {
    const historyContent = fullHistoryDisplayContainer.querySelector('.history-content');
    const historyEmpty = fullHistoryDisplayContainer.querySelector('.history-empty');
    const historyLoading = fullHistoryDisplayContainer.querySelector('.history-loading');

    historyLoading.classList.add('hidden');

    if (!history || history.length === 0) {
      historyEmpty.classList.remove('hidden');
      historyContent.classList.add('hidden');
      historyContent.innerHTML = '';
      return;
    }

    historyEmpty.classList.add('hidden');
    historyContent.classList.remove('hidden');
    historyContent.innerHTML = '';

    // Group history by video_id
    const groupedHistory = history.reduce((acc, msg) => {
      if (!acc[msg.video_id]) {
        acc[msg.video_id] = {
          title: msg.video_title || 'Untitled Video',
          youtube_id: msg.youtube_video_id || null,
          messages: []
        };
      }
      acc[msg.video_id].messages.push(msg);
      return acc;
    }, {});

    // Create expandable list
    Object.entries(groupedHistory).forEach(([videoId, data]) => {
      const youtubeVideoId = data.youtube_id || videoId;
      const details = document.createElement('details');
      details.classList.add('history-video-group');

      const summary = document.createElement('summary');
      summary.classList.add('history-video-title');
      const videoLink = document.createElement('a');
      videoLink.href = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
      videoLink.target = '_blank';
      videoLink.textContent = data.title;
      videoLink.classList.add('history-video-link');
      summary.appendChild(videoLink);
      details.appendChild(summary);

      const messageList = document.createElement('div');
      messageList.classList.add('history-message-list');
      data.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('history-message', `message-${msg.sender}`);
        const senderSpan = document.createElement('span');
        senderSpan.classList.add('history-sender');
        senderSpan.textContent = `${msg.sender === 'user' ? 'You' : 'AI'}: `;
        const messageText = document.createElement('span');
        messageText.textContent = msg.message;
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(messageText);

        if (msg.sender === 'ai') {
          const copyButton = document.createElement('button');
          copyButton.classList.add('button', 'copy-button', 'blue-gradient');
          copyButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9ZM20 20H11V11H20V20ZM7 13H5C3.89543 13 3 12.1046 3 11V4C3 2.89543 3.89543 2 5 2H14C15.1046 2 16 2.89543 16 4V6H13V4H5V11H7V13Z" fill="#ffffff"/>
          </svg>
        `;
          copyButton.addEventListener('click', () => copyToClipboard(msg.message));
          messageDiv.appendChild(copyButton);
        }

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('history-timestamp');
        timestampSpan.textContent = ` (${new Date(msg.timestamp).toLocaleString()})`;
        messageDiv.appendChild(timestampSpan);
        messageList.appendChild(messageDiv);
      });

      details.appendChild(messageList);
      historyContent.appendChild(details);
    });
  }

  async function fetchUserChatHistory(videoId = null) {
    const token = getToken();
    if (!token) {
      addErrorMessage('Please login to view chat history.');
      fullHistoryDisplayContainer.querySelector('.history-loading').classList.add('hidden');
      fullHistoryDisplayContainer.querySelector('.history-empty').classList.remove('hidden');
      return;
    }

    try {
      const url = videoId
        ? `http://127.0.0.1:3000/api/user-chat-history?videoId=${videoId}`
        : 'http://127.0.0.1:3000/api/user-chat-history';
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      renderChatHistory(data.history || []);
    } catch (error) {
      addErrorMessage('Error fetching user chat history: ' + error.message);
      fullHistoryDisplayContainer.querySelector('.history-loading').classList.add('hidden');
      fullHistoryDisplayContainer.querySelector('.history-empty').classList.remove('hidden');
    }
  }

  async function fetchAndProcessCaptions() {
    const token = getToken();
    if (!token) return addErrorMessage('Please login first.');
    if (captionsLoaded && window.currentYouTubeAIVideoId) return addInfoMessage('Data already loaded for this video.');

    addInfoMessage('Loading video data...');
    loadCaptionsButton.disabled = true;
    loadCaptionsButton.textContent = 'Loading...';

    const videoTitle = document.querySelector('title')?.textContent.trim().replace(/\s*-\s*YouTube$/, '') || 'No title';
    const descriptionElement = document.querySelector('#description span#plain-snippet-text, #description .ytd-expandable-video-description-body-renderer .yt-core-attributed-string');
    const videoDescription = descriptionElement ? descriptionElement.textContent.trim() : document.querySelector('#description yt-formatted-string.ytd-video-secondary-info-renderer')?.textContent.trim() || 'No description';
    const comments = Array.from(document.querySelectorAll('ytd-comment-thread-renderer #content-text')).slice(0, 15).map((c) => c.textContent.trim());

    let playerJson;
    try {
      const scripts = Array.from(document.scripts);
      for (const script of scripts) {
        if (script.textContent.includes('ytInitialPlayerResponse')) {
          const match = script.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});(?:var\s챱메타데이터|var\s메타데이터|var\s|$$ function\( $$\{var\sytplayer|\s*if\s*\()/s);
          if (match && match[1]) {
            playerJson = JSON.parse(match[1]);
            break;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing ytInitialPlayerResponse', e);
      playerJson = null;
    }

    if (!playerJson) {
      addErrorMessage('No player response. Cannot get captions URL.');
      videoTranscript = 'Player response not found.';
    }

    const tracks = playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    let track = tracks.find((t) => t.languageCode === 'en') || tracks.find((t) => t.baseUrl.includes('lang=en')) || tracks[0];

    if (!track) {
      addInfoMessage('No English captions found. Trying any available or proceeding without.');
      videoTranscript = 'No captions available.';
    } else {
      try {
        const res = await fetch(track.baseUrl);
        if (!res.ok) throw new Error(`Captions XML fetch failed: ${res.statusText}`);
        const xml = await res.text();
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        const lines = Array.from(doc.querySelectorAll('text'))
          .map((n) => n.textContent.trim().replace(/\n/g, ' ').replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)))
          .join(' ');
        videoTranscript = lines || ' ';
      } catch (error) {
        addErrorMessage('Failed to fetch/process captions: ' + error.message);
        videoTranscript = 'Failed to load captions.';
      }
    }

    const videoId = await sendDataToBackend(videoTitle, videoTranscript, videoDescription, comments);
    if (videoId) {
      window.currentYouTubeAIVideoId = videoId;
      captionsLoaded = true;
      if (videoTranscript.startsWith('No captions') || videoTranscript.startsWith('Failed to load')) {
        addInfoMessage(`Video data sent (captions: ${videoTranscript.split('.')[0]}).`);
      } else {
        addInfoMessage('Video data & captions sent to backend.');
      }
      loadCaptionsButton.textContent = 'Data Loaded';
      fetchChatHistory(videoId);
      fetchRecommendedQuestions(videoId); // Fetch recommended questions after loading video data
    } else {
      resetLoadButton();
      captionsLoaded = false;
    }
  }

  function resetLoadButton() {
    if (loadCaptionsButton) {
      loadCaptionsButton.disabled = false;
      loadCaptionsButton.textContent = 'Load Data';
    }
  }

  async function sendDataToBackend(title, transcript, description, comments) {
    const token = getToken();
    if (!token) {
      addErrorMessage('Please login first to send video data.');
      return null;
    }
    try {
      const youtubeVideoId = window.currentYouTubePageVideoId || '';
      const response = await fetch('http://127.0.0.1:3000/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, captions: transcript, description, comments, youtubeVideoId })
      });
      const data = await response.json();
      if (data.success && data.videoId) {
        return data.videoId;
      } else {
        addErrorMessage('Backend error: ' + (data.error || 'Failed to send data'));
        return null;
      }
    } catch (error) {
      addErrorMessage('Error sending data: ' + error.message);
      return null;
    }
  }

  async function getAIResponse(query) {
    const token = getToken();
    if (!token) return 'Please login first.';
    if (!window.currentYouTubeAIVideoId) {
      if (!captionsLoaded) {
        addInfoMessage('Video data not loaded. Attempting to load now...');
        await fetchAndProcessCaptions();
        if (!window.currentYouTubeAIVideoId) {
          return 'Video data could not be loaded. Please try "Load Data" first.';
        }
      } else {
        return 'Video context missing. Try "Load Data".';
      }
    }

    const thinkingMsg = Array.from(chatHistoryContainer.children).find((el) =>
      el.textContent.includes('AI: Thinking...')
    );
    if (thinkingMsg) thinkingMsg.remove();
    addMessageToChat('AI', 'Thinking...', 'ai');

    try {
      const response = await fetch('http://127.0.0.1:3000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ videoId: window.currentYouTubeAIVideoId, question: query })
      });
      const currentThinkingMsg = Array.from(chatHistoryContainer.children).find(
        (el) => el.textContent.includes('AI: Thinking...')
      );
      if (currentThinkingMsg) currentThinkingMsg.remove();
      const data = await response.json();
      return data.answer || 'No response from AI.';
    } catch (error) {
      const currentThinkingMsg = Array.from(chatHistoryContainer.children).find(
        (el) => el.textContent.includes('AI: Thinking...')
      );
      if (currentThinkingMsg) currentThinkingMsg.remove();
      return `Error querying AI: ${error.message}`;
    }
  }

  async function handleSendMessage() {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessageToChat('You', query, 'user');
    chatInput.value = '';

    if (!captionsLoaded && !window.currentYouTubeAIVideoId) {
      addInfoMessage('Attempting to load video data first...');
      await fetchAndProcessCaptions();
      if (!window.currentYouTubeAIVideoId) {
        addErrorMessage('Please load video data first using "Load Data" button.');
        return;
      }
    }
    const aiResponse = await getAIResponse(query);
    addMessageToChat('AI', aiResponse, 'ai');
  }

  function resetForNewVideo() {
    videoTranscript = '';
    captionsLoaded = false;
    window.currentYouTubeAIVideoId = null;

    if (chatHistoryContainer) chatHistoryContainer.innerHTML = '';
    if (fullHistoryDisplayContainer) {
      fullHistoryDisplayContainer.querySelector('.history-content').innerHTML = '';
      fullHistoryDisplayContainer.querySelector('.history-content').classList.add('hidden');
      fullHistoryDisplayContainer.querySelector('.history-empty').classList.add('hidden');
      fullHistoryDisplayContainer.querySelector('.history-loading').classList.remove('hidden');
    }
    if (document.querySelector('#youtube-ai-suggestions')) {
      document.querySelector('#youtube-ai-suggestions').classList.add('hidden');
      document.querySelector('#youtube-ai-suggestions-list').innerHTML = '';
    }

    if (getToken() && loginContainer && tabsContentContainer) {
      loginContainer.classList.add('hidden');
      tabsContentContainer.classList.remove('hidden');
      addMessageToChat('AI', 'New video. Load data to interact.', 'ai', true);
      switchTab('chat');
    } else if (loginContainer && tabsContentContainer) {
      loginContainer.classList.remove('hidden');
      tabsContentContainer.classList.add('hidden');
      addMessageToChat('AI', 'New video. Please login to start.', 'ai', true);
    }
    if (loadCaptionsButton) resetLoadButton();
  }
  function observeViewModeChanges() {
    const flexyElement = document.querySelector('ytd-watch-flexy');
    if (!flexyElement) return;

    if (viewModeObserver) viewModeObserver.disconnect();
    viewModeObserver = new MutationObserver((mutations) => {
      const newPageVideoId = flexyElement.getAttribute('video-id');
      let significantChange = false;

      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'theater' || mutation.attributeName === 'fullscreen_' || mutation.attributeName === 'fullscreen')) {
          significantChange = true;
          break;
        }
      }

      if (document.fullscreenElement && getCurrentViewMode().startsWith('fullscreen')) {
        significantChange = true;
      } else if (!document.fullscreenElement && getCurrentViewMode() !== 'default' && getCurrentViewMode() !== 'theater') {
        significantChange = true;
      }

      if (newPageVideoId && window.currentYouTubePageVideoId !== newPageVideoId) {
        console.log('Observer: Video ID changed from', window.currentYouTubePageVideoId, 'to', newPageVideoId);
        window.currentYouTubePageVideoId = newPageVideoId;
        setTimeout(() => {
          resetForNewVideo();
          injectChatUI();
        }, 300);
      } else if (significantChange) {
        console.log('Observer: View mode attribute changed (theater/fullscreen). Re-injecting UI.');
        setTimeout(injectChatUI, 300);
      }
    });
    viewModeObserver.observe(flexyElement, { attributes: true });
    document.addEventListener('fullscreenchange', () => {
      console.log('Document fullscreenchange event. Re-injecting UI.');
      setTimeout(injectChatUI, 300);
    });
    window.currentYouTubePageVideoId = flexyElement.getAttribute('video-id');
  }

  async function initialize() {
    ensureChatUIElements();
    injectChatUI();
    observeViewModeChanges();

    document.addEventListener('yt-navigate-finish', () => {
      console.log('yt-navigate-finish detected.');
      const flexy = document.querySelector('ytd-watch-flexy');
      if (flexy) window.currentYouTubePageVideoId = flexy.getAttribute('video-id');

      setTimeout(async () => {
        resetForNewVideo();
        injectChatUI();
        observeViewModeChanges();

        if (getToken()) {
          const isValid = await verifyToken();
          if (!isValid && loginContainer && tabsContentContainer) {
            loginContainer.classList.remove('hidden');
            tabsContentContainer.classList.add('hidden');
            addMessageToChat('AI', 'Session issue. Please login again.', 'ai', true);
          } else {
            fetchUserChatHistory(window.currentYouTubeAIVideoId); // Fetch history on page load if logged in
          }
        } else if (loginContainer && tabsContentContainer) {
          loginContainer.classList.remove('hidden');
          tabsContentContainer.classList.add('hidden');
        }
      }, 500);
    });

    if (getToken()) {
      const isValid = await verifyToken();
      if (!isValid && loginContainer && tabsContentContainer) {
        loginContainer.classList.remove('hidden');
        tabsContentContainer.classList.add('hidden');
        addMessageToChat('AI', 'Session expired. Please login.', 'ai', true);
      } else {
        fetchUserChatHistory(window.currentYouTubeAIVideoId); // Initial fetch if logged in
      }
    } else if (loginContainer && tabsContentContainer) {
      loginContainer.classList.remove('hidden');
      tabsContentContainer.classList.add('hidden');
    }
  }

  const checkPageReady = () => {
    if (document.querySelector('ytd-watch-flexy #secondary-inner') || document.querySelector('ytd-watch-flexy #primary-inner')) {
      initialize();
    } else if (attempts++ < 50) {
      setTimeout(checkPageReady, 200);
    } else {
      console.warn('YouTube AI Assistant: Key elements not found. Assistant may not load.');
    }
  };
  let attempts = 0;
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkPageReady();
  } else {
    document.addEventListener('DOMContentLoaded', checkPageReady);
  }
})();
