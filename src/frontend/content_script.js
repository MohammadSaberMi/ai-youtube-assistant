(() => {
  console.log('YouTube AI Assistant content script loaded.');

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

  let tabsContainer;
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
    }${expires}; path=/; SameSite=Strict`;
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

  function switchTab(tabName) {
    if (!tabsContainer) return;
    const tabButtons = tabsContainer.querySelectorAll('.tab-button');
    const tabPanes = tabsContainer.querySelectorAll('.tab-pane');

    tabButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tabName);
      if (button.dataset.tab === tabName) {
        button.style.background =
          button.dataset.tab === 'chat'
            ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
            : button.dataset.tab === 'settings'
            ? 'linear-gradient(90deg, #8b5cf6, #6d28d9)'
            : 'linear-gradient(90deg, #14b8a6, #0d9488)';
        button.style.color = '#ffffff';
        button.style.borderBottomColor = 'transparent';
        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
      } else {
        button.style.background = 'transparent';
        button.style.color = '#4b5563';
        button.style.borderBottomColor = '#ccc';
        button.style.boxShadow = 'none';
      }
    });
    tabPanes.forEach((pane) => {
      pane.style.display = pane.id === `tab-${tabName}` ? 'block' : 'none';
    });
  }

  function ensureChatUIElements() {
    if (chatContainer) return;

    chatContainer = document.createElement('div');
    chatContainer.id = 'youtube-ai-chat-container';
    chatContainer.style.border = '1px solid #e5e7eb';
    chatContainer.style.padding = '16px';
    chatContainer.style.backgroundColor = '#ffffff';
    chatContainer.style.width = '100%';
    chatContainer.style.marginBottom = '16px';
    chatContainer.style.display = 'none';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.boxSizing = 'border-box';
    chatContainer.style.borderRadius = '12px';
    chatContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    const header = document.createElement('div');
    header.id = 'youtube-ai-chat-header';
    header.textContent = 'Video AI Assistant';
    header.style.fontSize = '1.1em';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '12px';
    header.style.textAlign = 'center';
    header.style.color = '#1f2937';
    chatContainer.appendChild(header);

    loginContainer = document.createElement('div');
    loginContainer.id = 'youtube-ai-login-container';
    const usernameInput = document.createElement('input');
    usernameInput.placeholder = 'Username';
    usernameInput.style.marginBottom = '12px';
    usernameInput.style.width = 'calc(100% - 20px)';
    usernameInput.style.padding = '10px';
    usernameInput.style.border = '1px solid #d1d5db';
    usernameInput.style.borderRadius = '8px';
    usernameInput.style.fontSize = '0.95em';
    usernameInput.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    usernameInput.style.outline = 'none';
    usernameInput.addEventListener('focus', () => {
      usernameInput.style.borderColor = '#3b82f6';
      usernameInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
    });
    usernameInput.addEventListener('blur', () => {
      usernameInput.style.borderColor = '#d1d5db';
      usernameInput.style.boxShadow = 'none';
    });

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.style.marginBottom = '12px';
    passwordInput.style.width = 'calc(100% - 20px)';
    passwordInput.style.padding = '10px';
    passwordInput.style.border = '1px solid #d1d5db';
    passwordInput.style.borderRadius = '8px';
    passwordInput.style.fontSize = '0.95em';
    passwordInput.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    passwordInput.style.outline = 'none';
    passwordInput.addEventListener('focus', () => {
      passwordInput.style.borderColor = '#3b82f6';
      passwordInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
    });
    passwordInput.addEventListener('blur', () => {
      passwordInput.style.borderColor = '#d1d5db';
      passwordInput.style.boxShadow = 'none';
    });

    const loginButton = document.createElement('button');
    loginButton.textContent = 'Login';
    loginButton.style.padding = '10px';
    loginButton.style.width = '48%';
    loginButton.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
    loginButton.style.color = '#ffffff';
    loginButton.style.border = 'none';
    loginButton.style.borderRadius = '8px';
    loginButton.style.fontSize = '0.95em';
    loginButton.style.cursor = 'pointer';
    loginButton.style.transition = 'background 0.3s, transform 0.2s';
    loginButton.addEventListener('mouseover', () => {
      loginButton.style.background = 'linear-gradient(90deg, #2563eb, #1e40af)';
      loginButton.style.transform = 'scale(1.02)';
    });
    loginButton.addEventListener('mouseout', () => {
      loginButton.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
      loginButton.style.transform = 'scale(1)';
    });

    const signupButton = document.createElement('button');
    signupButton.textContent = 'Signup';
    signupButton.style.marginLeft = '4%';
    signupButton.style.padding = '10px';
    signupButton.style.width = '48%';
    signupButton.style.background = 'linear-gradient(90deg, #14b8a6, #0d9488)';
    signupButton.style.color = '#ffffff';
    signupButton.style.border = 'none';
    signupButton.style.borderRadius = '8px';
    signupButton.style.fontSize = '0.95em';
    signupButton.style.cursor = 'pointer';
    signupButton.style.transition = 'background 0.3s, transform 0.2s';
    signupButton.addEventListener('mouseover', () => {
      signupButton.style.background =
        'linear-gradient(90deg, #0d9488, #0f766e)';
      signupButton.style.transform = 'scale(1.02)';
    });
    signupButton.addEventListener('mouseout', () => {
      signupButton.style.background =
        'linear-gradient(90deg, #14b8a6, #0d9488)';
      signupButton.style.transform = 'scale(1)';
    });

    loginContainer.append(
      usernameInput,
      passwordInput,
      loginButton,
      signupButton
    );
    chatContainer.appendChild(loginContainer);

    tabsContainer = document.createElement('div');
    tabsContainer.id = 'youtube-ai-tabs-main';
    tabsContainer.style.display = 'none';

    const tabNav = document.createElement('div');
    tabNav.id = 'youtube-ai-tabs-nav';
    tabNav.style.display = 'flex';
    tabNav.style.marginBottom = '8px';
    tabNav.style.borderBottom = '1px solid #e5e7eb';

    ['Chat', 'Settings', 'History'].forEach((tabNameStr, index) => {
      const tabButton = document.createElement('button');
      tabButton.textContent = tabNameStr;
      tabButton.dataset.tab = tabNameStr.toLowerCase();
      tabButton.classList.add('tab-button');
      if (index === 0) tabButton.classList.add('active');
      tabButton.style.padding = '8px 16px';
      tabButton.style.border = '1px solid #e5e7eb';
      tabButton.style.borderBottom = 'none';
      tabButton.style.borderRadius = '8px 8px 0 0';
      tabButton.style.cursor = 'pointer';
      tabButton.style.fontSize = '0.95em';
      tabButton.style.fontWeight = '600';
      tabButton.style.marginRight = '4px';
      tabButton.style.color = '#4b5563';
      tabButton.style.background = 'transparent';
      tabButton.style.transition =
        'background 0.3s, color 0.3s, transform 0.2s, box-shadow 0.3s';
      tabButton.style.position = 'relative';
      tabButton.style.overflow = 'hidden';

      if (index === 0) {
        tabButton.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
        tabButton.style.color = '#ffffff';
        tabButton.style.borderBottomColor = 'transparent';
        tabButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
      }

      const hoverBackground =
        tabNameStr.toLowerCase() === 'chat'
          ? 'linear-gradient(90deg, #2563eb, #1e40af)'
          : tabNameStr.toLowerCase() === 'settings'
          ? 'linear-gradient(90deg, #6d28d9, #5b21b6)'
          : 'linear-gradient(90deg, #0d9488, #0f766e)';
      tabButton.style.setProperty(
        ':hover',
        `background: ${hoverBackground}; color: #ffffff; transform: scale(1.05); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);`
      );

      tabButton.addEventListener('click', () =>
        switchTab(tabNameStr.toLowerCase())
      );
      tabNav.appendChild(tabButton);
    });
    tabsContainer.appendChild(tabNav);

    const tabContent = document.createElement('div');
    tabContent.id = 'youtube-ai-tabs-content';

    chatTabPane = document.createElement('div');
    chatTabPane.id = 'tab-chat';
    chatTabPane.classList.add('tab-pane', 'active');
    chatTabPane.style.display = 'block';

    chatHistoryContainer = document.createElement('div');
    chatHistoryContainer.id = 'youtube-ai-chat-history';
    chatHistoryContainer.style.maxHeight = '200px';
    chatHistoryContainer.style.minHeight = '100px';
    chatHistoryContainer.style.overflowY = 'auto';
    chatHistoryContainer.style.border = '1px solid #e5e7eb';
    chatHistoryContainer.style.marginBottom = '8px';
    chatHistoryContainer.style.padding = '8px';
    chatHistoryContainer.style.fontSize = '0.9em';
    chatHistoryContainer.style.borderRadius = '8px';
    chatTabPane.appendChild(chatHistoryContainer);

    const inputArea = document.createElement('div');
    inputArea.id = 'youtube-ai-chat-input-area';
    inputArea.style.display = 'flex';
    inputArea.style.gap = '8px';

    chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Ask about the video...';
    chatInput.style.flexGrow = '1';
    chatInput.style.padding = '10px';
    chatInput.style.border = '1px solid #d1d5db';
    chatInput.style.borderRadius = '8px';
    chatInput.style.fontSize = '0.9em';
    chatInput.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    chatInput.style.outline = 'none';
    chatInput.addEventListener('focus', () => {
      chatInput.style.borderColor = '#3b82f6';
      chatInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
    });
    chatInput.addEventListener('blur', () => {
      chatInput.style.borderColor = '#d1d5db';
      chatInput.style.boxShadow = 'none';
    });

    sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.padding = '10px';
    sendButton.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
    sendButton.style.color = '#ffffff';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '8px';
    sendButton.style.fontSize = '0.9em';
    sendButton.style.cursor = 'pointer';
    sendButton.style.transition = 'background 0.3s, transform 0.2s';
    sendButton.addEventListener('mouseover', () => {
      sendButton.style.background = 'linear-gradient(90deg, #2563eb, #1e40af)';
      sendButton.style.transform = 'scale(1.02)';
    });
    sendButton.addEventListener('mouseout', () => {
      sendButton.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
      sendButton.style.transform = 'scale(1)';
    });

    loadCaptionsButton = document.createElement('button');
    loadCaptionsButton.textContent = 'Load Data';
    loadCaptionsButton.style.marginLeft = '5px';
    loadCaptionsButton.style.padding = '10px';
    loadCaptionsButton.style.background =
      'linear-gradient(90deg, #14b8a6, #0d9488)';
    loadCaptionsButton.style.color = '#ffffff';
    loadCaptionsButton.style.border = 'none';
    loadCaptionsButton.style.borderRadius = '8px';
    loadCaptionsButton.style.fontSize = '0.9em';
    loadCaptionsButton.style.cursor = 'pointer';
    loadCaptionsButton.style.transition = 'background 0.3s, transform 0.2s';
    loadCaptionsButton.addEventListener('mouseover', () => {
      loadCaptionsButton.style.background =
        'linear-gradient(90deg, #0d9488, #0f766e)';
      loadCaptionsButton.style.transform = 'scale(1.02)';
    });
    loadCaptionsButton.addEventListener('mouseout', () => {
      loadCaptionsButton.style.background =
        'linear-gradient(90deg, #14b8a6, #0d9488)';
      loadCaptionsButton.style.transform = 'scale(1)';
    });

    inputArea.append(chatInput, sendButton, loadCaptionsButton);
    chatTabPane.appendChild(inputArea);
    tabContent.appendChild(chatTabPane);

    settingsTabPane = document.createElement('div');
    settingsTabPane.id = 'tab-settings';
    settingsTabPane.classList.add('tab-pane');
    settingsTabPane.style.display = 'none';

    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'youtube-ai-settings-container';
    apiKeyInput = document.createElement('input');
    apiKeyInput.placeholder = 'OpenRouter API Key';
    apiKeyInput.style.marginBottom = '12px';
    apiKeyInput.style.width = 'calc(100% - 20px)';
    apiKeyInput.style.padding = '10px';
    apiKeyInput.style.border = '1px solid #d1d5db';
    apiKeyInput.style.borderRadius = '8px';
    apiKeyInput.style.fontSize = '0.9em';
    apiKeyInput.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    apiKeyInput.style.outline = 'none';
    apiKeyInput.addEventListener('focus', () => {
      apiKeyInput.style.borderColor = '#3b82f6';
      apiKeyInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
    });
    apiKeyInput.addEventListener('blur', () => {
      apiKeyInput.style.borderColor = '#d1d5db';
      apiKeyInput.style.boxShadow = 'none';
    });
    const savedApiKey = getCookie('userApiKey');
    if (savedApiKey) apiKeyInput.value = savedApiKey;

    setApiKeyButton = document.createElement('button');
    setApiKeyButton.textContent = 'Set API Key';
    setApiKeyButton.style.marginBottom = '10px';
    setApiKeyButton.style.padding = '10px';
    setApiKeyButton.style.width = '100%';
    setApiKeyButton.style.background =
      'linear-gradient(90deg, #8b5cf6, #6d28d9)';
    setApiKeyButton.style.color = '#ffffff';
    setApiKeyButton.style.border = 'none';
    setApiKeyButton.style.borderRadius = '8px';
    setApiKeyButton.style.fontSize = '0.9em';
    setApiKeyButton.style.cursor = 'pointer';
    setApiKeyButton.style.transition = 'background 0.3s, transform 0.2s';
    setApiKeyButton.addEventListener('mouseover', () => {
      setApiKeyButton.style.background =
        'linear-gradient(90deg, #6d28d9, #5b21b6)';
      setApiKeyButton.style.transform = 'scale(1.02)';
    });
    setApiKeyButton.addEventListener('mouseout', () => {
      setApiKeyButton.style.background =
        'linear-gradient(90deg, #8b5cf6, #6d28d9)';
      setApiKeyButton.style.transform = 'scale(1)';
    });

    modelSelect = document.createElement('select');
    modelSelect.innerHTML = '<option value="">Select a model</option>';
    modelSelect.style.width = '100%';
    modelSelect.style.padding = '10px';
    modelSelect.style.border = '1px solid #d1d5db';
    modelSelect.style.borderRadius = '8px';
    modelSelect.style.fontSize = '0.9em';
    modelSelect.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    modelSelect.style.outline = 'none';
    modelSelect.addEventListener('focus', () => {
      modelSelect.style.borderColor = '#3b82f6';
      modelSelect.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
    });
    modelSelect.addEventListener('blur', () => {
      modelSelect.style.borderColor = '#d1d5db';
      modelSelect.style.boxShadow = 'none';
    });

    settingsContainer.append(apiKeyInput, setApiKeyButton, modelSelect);
    settingsTabPane.appendChild(settingsContainer);
    tabContent.appendChild(settingsTabPane);

    historyTabPane = document.createElement('div');
    historyTabPane.id = 'tab-history';
    historyTabPane.classList.add('tab-pane');
    historyTabPane.style.display = 'none';
    fullHistoryDisplayContainer = document.createElement('div');
    fullHistoryDisplayContainer.id = 'youtube-ai-full-history-display';
    fullHistoryDisplayContainer.textContent =
      'History (feature in development).';
    fullHistoryDisplayContainer.style.padding = '10px';
    fullHistoryDisplayContainer.style.border = '1px solid #e5e7eb';
    fullHistoryDisplayContainer.style.height = '150px';
    fullHistoryDisplayContainer.style.overflowY = 'auto';
    fullHistoryDisplayContainer.style.fontSize = '0.9em';
    fullHistoryDisplayContainer.style.borderRadius = '8px';
    historyTabPane.appendChild(fullHistoryDisplayContainer);
    tabContent.appendChild(historyTabPane);

    tabsContainer.appendChild(tabContent);
    chatContainer.appendChild(tabsContainer);

    loginButton.addEventListener('click', () =>
      login(usernameInput.value, passwordInput.value)
    );
    signupButton.addEventListener('click', () =>
      signup(usernameInput.value, passwordInput.value)
    );
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
      chatContainer.style.display = 'none';
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
      chatContainer.style.display = 'flex';
    } else if (chatContainer) {
      chatContainer.style.display = 'none';
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
    messageDiv.classList.add('youtube-ai-chat-message', type);
    if (isInitial) messageDiv.classList.add('initial-greeting');

    const senderStrong = document.createElement('strong');
    senderStrong.textContent = `${sender}: `;
    messageDiv.appendChild(senderStrong);
    messageDiv.append(message);

    if (type === 'ai') senderStrong.style.color = 'cornflowerblue';
    if (type === 'user') senderStrong.style.color = 'mediumseagreen';
    if (type === 'error') {
      senderStrong.style.color = 'crimson';
      messageDiv.style.color = 'crimson';
    }
    if (type === 'info') senderStrong.style.color = 'slateblue';
    messageDiv.style.padding = '8px';
    messageDiv.style.borderRadius = '6px';
    messageDiv.style.marginBottom = '8px';
    messageDiv.style.backgroundColor =
      type === 'user' ? '#f0f9ff' : type === 'ai' ? '#f8fafc' : '#fef2f2';

    chatHistoryContainer.appendChild(messageDiv);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
  }

  function addInfoMessage(message) {
    addMessageToChat('System', message, 'info');
  }
  function addErrorMessage(message) {
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
        if (loginContainer) loginContainer.style.display = 'none';
        if (tabsContainer) tabsContainer.style.display = 'block';
        fetchModels();
        if (window.currentYouTubeAIVideoId)
          fetchChatHistory(window.currentYouTubeAIVideoId);
        return true;
      } else {
        deleteCookie('token');
        if (loginContainer) loginContainer.style.display = 'block';
        if (tabsContainer) tabsContainer.style.display = 'none';
        return false;
      }
    } catch (error) {
      deleteCookie('token');
      if (loginContainer) loginContainer.style.display = 'block';
      if (tabsContainer) tabsContainer.style.display = 'none';
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
        loginContainer.style.display = 'none';
        tabsContainer.style.display = 'block';
        fetchModels();
        if (window.currentYouTubeAIVideoId)
          fetchChatHistory(window.currentYouTubeAIVideoId);
      } else {
        addErrorMessage('Login failed: ' + data.error);
        loginContainer.style.display = 'block';
        tabsContainer.style.display = 'none';
      }
    } catch (error) {
      addErrorMessage('Login error: ' + error.message);
      loginContainer.style.display = 'block';
      tabsContainer.style.display = 'none';
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
    if (!token) return;
    if (!modelSelect) return;
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
    if (!token) return;
    if (!chatHistoryContainer) return;

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
      } else if (!isInitialMessagePresent()) {
        // chatHistoryContainer.innerHTML = '';
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

  function isInitialMessagePresent() {
    return (
      chatHistoryContainer &&
      chatHistoryContainer.firstChild?.classList.contains('initial-greeting')
    );
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
            /ytInitialPlayerResponse\s*=\s*(\{.*?\});(?:var\s챱메타데이터|var\s메타데이터|var\s|\(function\(\)\{var\sytplayer|\s*if\s*\()/s
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
          comments
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
    if (fullHistoryDisplayContainer)
      fullHistoryDisplayContainer.textContent =
        'History (feature in development).';

    if (getToken() && loginContainer && tabsContainer) {
      loginContainer.style.display = 'none';
      tabsContainer.style.display = 'block';
      addMessageToChat('AI', 'New video. Load data to interact.', 'ai', true);
      switchTab('chat');
    } else if (loginContainer && tabsContainer) {
      loginContainer.style.display = 'block';
      tabsContainer.style.display = 'none';
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

        if (getToken() && !window.currentYouTubeAIVideoId) {
          const isValid = await verifyToken();
          if (isValid) {
          } else if (loginContainer && tabsContainer) {
            loginContainer.style.display = 'block';
            tabsContainer.style.display = 'none';
            addMessageToChat(
              'AI',
              'Session issue. Please login again.',
              'ai',
              true
            );
          }
        } else if (!getToken() && loginContainer && tabsContainer) {
          loginContainer.style.display = 'block';
          tabsContainer.style.display = 'none';
        }
      }, 500);
    });

    if (getToken()) {
      const isValid = await verifyToken();
      if (!isValid && loginContainer && tabsContainer) {
        loginContainer.style.display = 'block';
        tabsContainer.style.display = 'none';
        addMessageToChat('AI', 'Session expired. Please login.', 'ai', true);
      }
    } else if (loginContainer && tabsContainer) {
      loginContainer.style.display = 'block';
      tabsContainer.style.display = 'none';
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
