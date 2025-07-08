(() => {
  console.log('YouTube AI Assistant content script loaded.');

  const chatUIHTML = `
  <div id="youtube-ai-chat-container" class="youtube-ai-chat-container">
    <div id="youtube-ai-chat-header" class="youtube-ai-chat-header">
   
      <div class="tab-nav">
        <button data-tab="chat" class="tab-button icon-button active" title="Chat">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.5395 3C14.6303 3 13.7583 3.3599 13.1154 4.00052L9.07222 8.02925C7.21527 9.87957 5.89791 12.198 5.26098 14.7366L5.06561 15.5153C4.86299 16.3229 5.59714 17.0544 6.40764 16.8525L7.1891 16.6578C9.73681 16.0232 12.0635 14.7105 13.9205 12.8602L17.9636 8.83146C18.6066 8.19084 18.9678 7.32196 18.9678 6.41599C18.9678 4.52939 17.4329 3 15.5395 3ZM14.3776 7.57378C14.9965 8.19047 15.714 8.45317 16.2462 8.36088L16.8688 7.74049C17.2213 7.38921 17.4194 6.91278 17.4194 6.41599C17.4194 5.38149 16.5777 4.54286 15.5395 4.54286C15.041 4.54286 14.5628 4.7402 14.2103 5.09149L13.5877 5.71187C13.495 6.24217 13.7587 6.95709 14.3776 7.57378Z" fill="#363853"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M4 20.2286C4 19.8025 4.34662 19.4571 4.77419 19.4571H19.2258C19.6534 19.4571 20 19.8025 20 20.2286C20 20.6546 19.6534 21 19.2258 21H4.77419C4.34662 21 4 20.6546 4 20.2286Z" fill="#363853"/>
</svg>

        </button>
        <button data-tab="settings" class="tab-button icon-button" title="Settings">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.29701 5.2338C3.52243 4.27279 4.27279 3.52243 5.2338 3.29701C6.06663 3.10165 6.93337 3.10165 7.7662 3.29701C8.72721 3.52243 9.47757 4.27279 9.70299 5.2338C9.89835 6.06663 9.89835 6.93337 9.70299 7.7662C9.47757 8.72721 8.72721 9.47757 7.7662 9.70299C6.93337 9.89835 6.06663 9.89835 5.2338 9.70299C4.27279 9.47757 3.52243 8.72721 3.29701 7.7662C3.10166 6.93337 3.10166 6.06663 3.29701 5.2338Z" fill="#363853" fill-opacity="0.15" stroke="#363853" stroke-width="1.5"/>
<path d="M3.29701 16.2338C3.52243 15.2728 4.27279 14.5224 5.2338 14.297C6.06663 14.1017 6.93337 14.1017 7.7662 14.297C8.72721 14.5224 9.47757 15.2728 9.70299 16.2338C9.89835 17.0666 9.89835 17.9334 9.70299 18.7662C9.47757 19.7272 8.72721 20.4776 7.7662 20.703C6.93337 20.8983 6.06663 20.8983 5.2338 20.703C4.27279 20.4776 3.52243 19.7272 3.29701 18.7662C3.10166 17.9334 3.10166 17.0666 3.29701 16.2338Z" fill="#363853" fill-opacity="0.15" stroke="#363853" stroke-width="1.5"/>
<path d="M14.297 5.2338C14.5224 4.27279 15.2728 3.52243 16.2338 3.29701C17.0666 3.10165 17.9334 3.10165 18.7662 3.29701C19.7272 3.52243 20.4776 4.27279 20.703 5.2338C20.8983 6.06663 20.8983 6.93337 20.703 7.7662C20.4776 8.72721 19.7272 9.47757 18.7662 9.70299C17.9334 9.89835 17.0666 9.89835 16.2338 9.70299C15.2728 9.47757 14.5224 8.72721 14.297 7.7662C14.1017 6.93337 14.1017 6.06663 14.297 5.2338Z" fill="#363853" fill-opacity="0.15" stroke="#363853" stroke-width="1.5"/>
<path d="M14.297 16.2338C14.5224 15.2728 15.2728 14.5224 16.2338 14.297C17.0666 14.1017 17.9334 14.1017 18.7662 14.297C19.7272 14.5224 20.4776 15.2728 20.703 16.2338C20.8983 17.0666 20.8983 17.9334 20.703 18.7662C20.4776 19.7272 19.7272 20.4776 18.7662 20.703C17.9334 20.8983 17.0666 20.8983 16.2338 20.703C15.2728 20.4776 14.5224 19.7272 14.297 18.7662C14.1017 17.9334 14.1017 17.0666 14.297 16.2338Z" fill="#363853" fill-opacity="0.15" stroke="#363853" stroke-width="1.5"/>
</svg>


        </button>
        <button data-tab="history" class="tab-button icon-button" title="History">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.86241 10.7032C3.38351 12.513 3.37707 14.4414 3.85597 16.2511C4.44153 18.464 6.22102 20.1547 8.45287 20.6188L8.60824 20.6511C10.8457 21.1163 13.1543 21.1163 15.3918 20.6511L15.5471 20.6188C17.779 20.1547 19.5585 18.464 20.144 16.2511C20.6229 14.4414 20.6165 12.513 20.1376 10.7032C19.5611 8.52447 17.8007 6.82847 15.6032 6.37155C13.2263 5.87731 10.7737 5.87731 8.39677 6.37155M3.86241 10.7032C4.43895 8.52447 6.1993 6.82847 8.39677 6.37155M3.86241 10.7032C3.66414 11.4525 3.54685 12.2221 3.51146 12.9952V7.25212C3.51146 5.3599 4.79687 3.69319 6.61272 3.19064C7.06583 3.06524 7.53975 3 8.00974 3H8.8677C10.5489 3 12.5221 4.31117 13.2463 6.04481C12.04 6.04503 9.58417 6.12466 8.39677 6.37155M14.6103 8.76913L14.6529 8.77627C16.4358 9.07479 17.7426 10.6245 17.7426 12.4404M3.51146 13.9964V14.0138L3.5124 14.0164C3.51208 14.0097 3.51177 14.0031 3.51146 13.9964Z" stroke="#363853" stroke-width="1.5" stroke-linecap="round"/>
</svg>

        </button>
        <span class="flex-1">   Video AI Assistant</span>
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
          
          <button class="button chat-button blue-gradient">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.11933 4.38421C6.32524 2.98547 3.22434 5.63695 4.17515 8.61184L5.26247 12.0138L4.18106 15.3845C3.22719 18.3576 6.32366 21.0124 9.11924 19.6182L18.0461 15.1663C20.6491 13.8682 20.6519 10.1575 18.0509 8.85543L9.11933 4.38421Z" fill="#363853"/>
            </svg>
          </button>
          <button class="button chat-button green-gradient load-captions-spacing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 14.5L12 4.5M12 14.5C11.2998 14.5 9.99153 12.5057 9.5 12M12 14.5C12.7002 14.5 14.0085 12.5057 14.5 12" stroke="#141B34" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 16.5C20 18.982 19.482 19.5 17 19.5H7C4.518 19.5 4 18.982 4 16.5" stroke="#141B34" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </button>
          <input type="text" placeholder="Ask about the video..." class="input-field chat-input" />
        </div>
      </div>
      <div id="tab-settings" class="tab-pane">
        <div id="youtube-ai-settings-container">
          <input placeholder="OpenRouter API Key" class="input-field chat-input" />
          <button class="button full-width purple-gradient">Set API Key
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 2C5.73858 2 3.5 4.23858 3.5 7C3.5 8.85071 4.5055 10.4666 6 11.3311V17.8431C6 18.6606 6 19.0694 6.15224 19.4369C6.30448 19.8045 6.59351 20.0935 7.17157 20.6716L8.5 22L10.6082 19.8918C10.7054 19.7946 10.7541 19.7459 10.7944 19.6932C10.9003 19.5547 10.9682 19.3909 10.9912 19.218C11 19.1522 11 19.0834 11 18.9459C11 18.8346 11 18.779 10.9941 18.7249C10.9786 18.5831 10.933 18.4463 10.8603 18.3236C10.8326 18.2768 10.7992 18.2323 10.7325 18.1433L9.5 16.5L10.2 15.5667C10.5965 15.038 10.7947 14.7737 10.8974 14.4658C11 14.1579 11 13.8275 11 13.1667V11.3311C12.4945 10.4666 13.5 8.85071 13.5 7C13.5 4.23858 11.2614 2 8.5 2Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M8.5 7H8.50898" stroke="#141B34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </button>
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
    document.cookie = `${name}=${
      value || ''
    }${expires}; path=/; SameSite=Strict; Secure`;
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
      if (
        flexyElement.hasAttribute('theater') ||
        flexyElement.hasAttribute('fullscreen')
      ) {
        if (flexyElement.hasAttribute('fullscreen_'))
          return 'fullscreen_player';
        return 'theater';
      }
    }
    if (
      document.fullscreenElement &&
      document.querySelector('.html5-video-player.ytp-fullscreen')
    ) {
      return 'fullscreen_browser';
    }
    return 'default';
  }
  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addInfoMessage('Answer copied to clipboard!');
      })
      .catch((err) => {
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

    const selectedButton = Array.from(tabButtons).find(
      (button) => button.dataset.tab === tabName
    );
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
      const response = await fetch(
        `http://127.0.0.1:3000/api/recommended-questions/${videoId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        renderSuggestedQuestions(data.questions);
      } else {
        addErrorMessage(
          'Failed to load suggested questions: ' +
            (data.error || 'No questions returned')
        );
        renderSuggestedQuestions([]);
      }
    } catch (error) {
      addErrorMessage('Error fetching suggested questions: ' + error.message);
      renderSuggestedQuestions([]);
    }
  }

  function renderSuggestedQuestions(questions) {
    const suggestionsContainer = document.querySelector(
      '#youtube-ai-suggestions'
    );
    const suggestionsList = document.querySelector(
      '#youtube-ai-suggestions-list'
    );

    if (!suggestionsContainer || !suggestionsList) return;

    suggestionsList.innerHTML = '';
    if (questions.length === 0) {
      suggestionsContainer.classList.add('hidden');
      return;
    }

    suggestionsContainer.classList.remove('hidden');
    questions.forEach((question) => {
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
    tabsContentContainer = chatContainer.querySelector(
      '#youtube-ai-tabs-content'
    );
    chatTabPane = chatContainer.querySelector('#tab-chat');
    settingsTabPane = chatContainer.querySelector('#tab-settings');
    historyTabPane = chatContainer.querySelector('#tab-history');
    chatHistoryContainer = chatContainer.querySelector(
      '#youtube-ai-chat-history'
    );
    fullHistoryDisplayContainer = chatContainer.querySelector(
      '#youtube-ai-full-history-display'
    );
    chatInput = chatContainer.querySelector(
      '#youtube-ai-chat-input-area .chat-input'
    );
    sendButton = chatContainer.querySelector(
      '#youtube-ai-chat-input-area .blue-gradient'
    );
    loadCaptionsButton = chatContainer.querySelector(
      '#youtube-ai-chat-input-area .green-gradient'
    );
    apiKeyInput = chatContainer.querySelector(
      '#youtube-ai-settings-container .chat-input'
    );
    setApiKeyButton = chatContainer.querySelector(
      '#youtube-ai-settings-container .purple-gradient'
    );
    modelSelect = chatContainer.querySelector(
      '#youtube-ai-settings-container .select-field'
    );
    const suggestionsContainer = chatContainer.querySelector(
      '#youtube-ai-suggestions'
    );
    const suggestionsList = chatContainer.querySelector(
      '#youtube-ai-suggestions-list'
    );

    const savedApiKey = getCookie('userApiKey');
    if (savedApiKey) apiKeyInput.value = savedApiKey;

    loginContainer
      .querySelector('.blue-gradient')
      .addEventListener('click', () => {
        const usernameInput = loginContainer.querySelector(
          'input[placeholder="Username"]'
        );
        const passwordInput = loginContainer.querySelector(
          'input[placeholder="Password"]'
        );
        login(usernameInput.value, passwordInput.value);
      });
    loginContainer
      .querySelector('.green-gradient')
      .addEventListener('click', () => {
        const usernameInput = loginContainer.querySelector(
          'input[placeholder="Username"]'
        );
        const passwordInput = loginContainer.querySelector(
          'input[placeholder="Password"]'
        );
        signup(usernameInput.value, passwordInput.value);
      });
    setApiKeyButton.addEventListener('click', () =>
      setApiKey(apiKeyInput.value)
    );
    modelSelect.addEventListener('change', () => setModel(modelSelect.value));
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener(
      'keypress',
      (e) => e.key === 'Enter' && handleSendMessage()
    );
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
      console.log(
        'YouTube AI Assistant: In fullscreen mode, UI will not be injected.'
      );
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
      parentElement = document.querySelector(
        'ytd-watch-flexy div#secondary-inner'
      );
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
      console.warn(
        'YouTube AI Assistant: Could not find suitable parent to inject UI for view mode:',
        viewMode
      );
    }
  }

  function addMessageToChat(sender, message, type = 'info', isInitial = false) {
    if (!chatHistoryContainer) return;
    if (
      !isInitial &&
      chatHistoryContainer.firstChild?.classList.contains('initial-greeting')
    ) {
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
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
        if (window.currentYouTubeAIVideoId)
          fetchChatHistory(window.currentYouTubeAIVideoId);
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
        if (window.currentYouTubeAIVideoId)
          fetchChatHistory(window.currentYouTubeAIVideoId);
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
      if (modelSelect)
        modelSelect.innerHTML = '<option value="">Error</option>';
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
      const response = await fetch(
        `http://127.0.0.1:3000/api/chat-history/${videoId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (
        chatHistoryContainer.firstChild?.classList.contains('initial-greeting')
      ) {
        chatHistoryContainer.innerHTML = '';
      }
      if (data.history && data.history.length > 0) {
        data.history.forEach((msg) => {
          addMessageToChat(
            msg.sender === 'user' ? 'You' : 'AI',
            msg.message,
            msg.sender
          );
        });
      }
    } catch (error) {
      addErrorMessage('Error fetching chat history: ' + error.message);
    }
  }

  function renderChatHistory(history) {
    const historyContent =
      fullHistoryDisplayContainer.querySelector('.history-content');
    const historyEmpty =
      fullHistoryDisplayContainer.querySelector('.history-empty');
    const historyLoading =
      fullHistoryDisplayContainer.querySelector('.history-loading');

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
      data.messages.forEach((msg) => {
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
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        `;
          copyButton.addEventListener('click', () =>
            copyToClipboard(msg.message)
          );
          messageDiv.appendChild(copyButton);
        }

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('history-timestamp');
        timestampSpan.textContent = ` (${new Date(
          msg.timestamp
        ).toLocaleString()})`;
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
      fullHistoryDisplayContainer
        .querySelector('.history-loading')
        .classList.add('hidden');
      fullHistoryDisplayContainer
        .querySelector('.history-empty')
        .classList.remove('hidden');
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
      fullHistoryDisplayContainer
        .querySelector('.history-loading')
        .classList.add('hidden');
      fullHistoryDisplayContainer
        .querySelector('.history-empty')
        .classList.remove('hidden');
    }
  }

  async function fetchAndProcessCaptions() {
    const token = getToken();
    if (!token) return addErrorMessage('Please login first.');
    if (captionsLoaded && window.currentYouTubeAIVideoId)
      return addInfoMessage('Data already loaded for this video.');

    addInfoMessage('Loading video data...');
    loadCaptionsButton.disabled = true;
    loadCaptionsButton.textContent = 'Loading...';

    const videoTitle =
      document
        .querySelector('title')
        ?.textContent.trim()
        .replace(/\s*-\s*YouTube$/, '') || 'No title';
    const descriptionElement = document.querySelector(
      '#description span#plain-snippet-text, #description .ytd-expandable-video-description-body-renderer .yt-core-attributed-string'
    );
    const videoDescription = descriptionElement
      ? descriptionElement.textContent.trim()
      : document
          .querySelector(
            '#description yt-formatted-string.ytd-video-secondary-info-renderer'
          )
          ?.textContent.trim() || 'No description';
    const comments = Array.from(
      document.querySelectorAll('ytd-comment-thread-renderer #content-text')
    )
      .slice(0, 15)
      .map((c) => c.textContent.trim());

    let playerJson;
    try {
      const scripts = Array.from(document.scripts);
      for (const script of scripts) {
        if (script.textContent.includes('ytInitialPlayerResponse')) {
          const match = script.textContent.match(
            /ytInitialPlayerResponse\s*=\s*(\{.*?\});(?:var\s챱메타데이터|var\s메타데이터|var\s|$$ function\( $$\{var\sytplayer|\s*if\s*\()/s
          );
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

    const tracks =
      playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
      [];
    let track =
      tracks.find((t) => t.languageCode === 'en') ||
      tracks.find((t) => t.baseUrl.includes('lang=en')) ||
      tracks[0];

    if (!track) {
      addInfoMessage(
        'No English captions found. Trying any available or proceeding without.'
      );
      videoTranscript = 'No captions available.';
    } else {
      try {
        const res = await fetch(track.baseUrl);
        if (!res.ok)
          throw new Error(`Captions XML fetch failed: ${res.statusText}`);
        const xml = await res.text();
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        const lines = Array.from(doc.querySelectorAll('text'))
          .map((n) =>
            n.textContent
              .trim()
              .replace(/\n/g, ' ')
              .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
          )
          .join(' ');
        videoTranscript = lines || ' ';
      } catch (error) {
        addErrorMessage('Failed to fetch/process captions: ' + error.message);
        videoTranscript = 'Failed to load captions.';
      }
    }

    const videoId = await sendDataToBackend(
      videoTitle,
      videoTranscript,
      videoDescription,
      comments
    );
    if (videoId) {
      window.currentYouTubeAIVideoId = videoId;
      captionsLoaded = true;
      if (
        videoTranscript.startsWith('No captions') ||
        videoTranscript.startsWith('Failed to load')
      ) {
        addInfoMessage(
          `Video data sent (captions: ${videoTranscript.split('.')[0]}).`
        );
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
        body: JSON.stringify({
          title,
          captions: transcript,
          description,
          comments,
          youtubeVideoId
        })
      });
      const data = await response.json();
      if (data.success && data.videoId) {
        return data.videoId;
      } else {
        addErrorMessage(
          'Backend error: ' + (data.error || 'Failed to send data')
        );
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
        body: JSON.stringify({
          videoId: window.currentYouTubeAIVideoId,
          question: query
        })
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
        addErrorMessage(
          'Please load video data first using "Load Data" button.'
        );
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
      fullHistoryDisplayContainer.querySelector('.history-content').innerHTML =
        '';
      fullHistoryDisplayContainer
        .querySelector('.history-content')
        .classList.add('hidden');
      fullHistoryDisplayContainer
        .querySelector('.history-empty')
        .classList.add('hidden');
      fullHistoryDisplayContainer
        .querySelector('.history-loading')
        .classList.remove('hidden');
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
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'theater' ||
            mutation.attributeName === 'fullscreen_' ||
            mutation.attributeName === 'fullscreen')
        ) {
          significantChange = true;
          break;
        }
      }

      if (
        document.fullscreenElement &&
        getCurrentViewMode().startsWith('fullscreen')
      ) {
        significantChange = true;
      } else if (
        !document.fullscreenElement &&
        getCurrentViewMode() !== 'default' &&
        getCurrentViewMode() !== 'theater'
      ) {
        significantChange = true;
      }

      if (
        newPageVideoId &&
        window.currentYouTubePageVideoId !== newPageVideoId
      ) {
        console.log(
          'Observer: Video ID changed from',
          window.currentYouTubePageVideoId,
          'to',
          newPageVideoId
        );
        window.currentYouTubePageVideoId = newPageVideoId;
        setTimeout(() => {
          resetForNewVideo();
          injectChatUI();
        }, 300);
      } else if (significantChange) {
        console.log(
          'Observer: View mode attribute changed (theater/fullscreen). Re-injecting UI.'
        );
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
      if (flexy)
        window.currentYouTubePageVideoId = flexy.getAttribute('video-id');

      setTimeout(async () => {
        resetForNewVideo();
        injectChatUI();
        observeViewModeChanges();

        if (getToken()) {
          const isValid = await verifyToken();
          if (!isValid && loginContainer && tabsContentContainer) {
            loginContainer.classList.remove('hidden');
            tabsContentContainer.classList.add('hidden');
            addMessageToChat(
              'AI',
              'Session issue. Please login again.',
              'ai',
              true
            );
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
    if (
      document.querySelector('ytd-watch-flexy #secondary-inner') ||
      document.querySelector('ytd-watch-flexy #primary-inner')
    ) {
      initialize();
    } else if (attempts++ < 50) {
      setTimeout(checkPageReady, 200);
    } else {
      console.warn(
        'YouTube AI Assistant: Key elements not found. Assistant may not load.'
      );
    }
  };
  let attempts = 0;
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    checkPageReady();
  } else {
    document.addEventListener('DOMContentLoaded', checkPageReady);
  }
})();
