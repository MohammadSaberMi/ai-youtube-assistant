(() => {
  console.log("YouTube AI Assistant content script loaded.");

  let videoTranscript = "";
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

  // Cookie management functions
  const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
  };

  // Utility to get JWT token from cookie
  const getToken = () => getCookie("token");

  // Function to determine current YouTube view mode
  function getCurrentViewMode() {
    const flexyElement = document.querySelector("ytd-watch-flexy");
    if (flexyElement && (flexyElement.hasAttribute("theater") || flexyElement.hasAttribute("fullscreen"))) {
      return "theater";
    }
    return "default";
  }

  // Function to create chat UI elements
  function ensureChatUIElements() {
    if (chatContainer) return;

    chatContainer = document.createElement("div");
    chatContainer.id = "youtube-ai-chat-container";

    const header = document.createElement("div");
    header.id = "youtube-ai-chat-header";
    header.textContent = "Video AI Assistant";
    chatContainer.appendChild(header);

    // Login/signup area
    loginContainer = document.createElement("div");
    loginContainer.id = "youtube-ai-login-container";
    const usernameInput = document.createElement("input");
    usernameInput.placeholder = "Username";
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    const signupButton = document.createElement("button");
    signupButton.textContent = "Signup";
    loginContainer.append(usernameInput, passwordInput, loginButton, signupButton);
    chatContainer.appendChild(loginContainer);

    // API key and model selection
    const settingsContainer = document.createElement("div");
    settingsContainer.id = "youtube-ai-settings-container";
    apiKeyInput = document.createElement("input");
    apiKeyInput.placeholder = "OpenRouter API Key";
    setApiKeyButton = document.createElement("button");
    setApiKeyButton.textContent = "Set API Key";
    modelSelect = document.createElement("select");
    modelSelect.innerHTML = '<option value="">Select a model</option>';
    settingsContainer.append(apiKeyInput, setApiKeyButton, modelSelect);
    chatContainer.appendChild(settingsContainer);

    chatHistoryContainer = document.createElement("div");
    chatHistoryContainer.id = "youtube-ai-chat-history";
    chatContainer.appendChild(chatHistoryContainer);

    const inputArea = document.createElement("div");
    inputArea.id = "youtube-ai-chat-input-area";
    chatInput = document.createElement("input");
    chatInput.type = "text";
    chatInput.placeholder = "Ask about the video...";
    sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    loadCaptionsButton = document.createElement("button");
    loadCaptionsButton.textContent = "Load Captions";
    inputArea.append(chatInput, sendButton, loadCaptionsButton);
    chatContainer.appendChild(inputArea);

    // Event listeners
    loginButton.addEventListener("click", () => login(usernameInput.value, passwordInput.value));
    signupButton.addEventListener("click", () => signup(usernameInput.value, passwordInput.value));
    setApiKeyButton.addEventListener("click", () => setApiKey(apiKeyInput.value));
    modelSelect.addEventListener("change", () => setModel(modelSelect.value));
    sendButton.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => e.key === "Enter" && handleSendMessage());
    loadCaptionsButton.addEventListener("click", fetchAndProcessCaptions);

    addMessageToChat("AI", "Please login or signup to start.", "ai", true);
  }

  // Function to inject the chat UI
  function injectChatUI() {
    ensureChatUIElements();
    const viewMode = getCurrentViewMode();
    let parentElement =
      viewMode === "theater"
        ? document.querySelector("div#primary-inner")
        : document.querySelector("div#secondary-inner");
    const insertBeforeElement =
      viewMode === "theater"
        ? parentElement?.querySelector("ytd-comments#comments")
        : parentElement?.firstChild;

    if (parentElement && chatContainer) {
      if (insertBeforeElement) {
        parentElement.insertBefore(chatContainer, insertBeforeElement);
      } else {
        parentElement.appendChild(chatContainer);
      }
      chatContainer.style.display = "flex";
    } else if (chatContainer) {
      chatContainer.style.display = "none";
    }
  }

  // Add message to chat history
  function addMessageToChat(sender, message, type = "info", isInitial = false) {
    if (!chatHistoryContainer) return;
    if (!isInitial && chatHistoryContainer.firstChild?.classList.contains("initial-greeting")) {
      chatHistoryContainer.innerHTML = "";
    }

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("youtube-ai-chat-message", type);
    if (isInitial) messageDiv.classList.add("initial-greeting");
    messageDiv.textContent = `${sender}: ${message}`;
    chatHistoryContainer.appendChild(messageDiv);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
  }

  function addInfoMessage(message) {
    addMessageToChat("System", message, "info");
  }
  function addErrorMessage(message) {
    addMessageToChat("Error", message, "error");
  }

  // **Verify Token**
  async function verifyToken() {
    const token = getToken();
    if (!token) return false;
    try {
      const response = await fetch("http://127.0.0.1:3000/api/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loginContainer.style.display = "none";
        fetchModels();
        if (window.currentYouTubeAIVideoId) fetchChatHistory(window.currentYouTubeAIVideoId);
        return true;
      } else {
        deleteCookie("token");
        return false;
      }
    } catch (error) {
      deleteCookie("token");
      return false;
    }
  }

  // **Login**
  async function login(username, password) {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        setCookie("token", data.token, 7); // Store token for 7 days
        addInfoMessage("Logged in successfully!");
        loginContainer.style.display = "none";
        fetchModels();
        if (window.currentYouTubeAIVideoId) fetchChatHistory(window.currentYouTubeAIVideoId);
      } else {
        addErrorMessage("Login failed: " + data.error);
      }
    } catch (error) {
      addErrorMessage("Login error: " + error.message);
    }
  }

  // **Signup**
  async function signup(username, password) {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        addInfoMessage("Signed up successfully! Please login.");
      } else {
        addErrorMessage("Signup failed: " + data.error);
      }
    } catch (error) {
      addErrorMessage("Signup error: " + error.message);
    }
  }

  // **Set API Key**
  async function setApiKey(apiKey) {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    try {
      const response = await fetch("http://127.0.0.1:3000/api/set-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json();
      if (data.success) {
        addInfoMessage("API key set successfully.");
        fetchModels();
      } else {
        addErrorMessage("Failed to set API key: " + data.error);
      }
    } catch (error) {
      addErrorMessage("Error setting API key: " + error.message);
    }
  }

  // **Fetch Models**
  async function fetchModels() {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    try {
      const response = await fetch("http://127.0.0.1:3000/api/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data.data)) {
        modelSelect.innerHTML = '<option value="">Select a model</option>';
        data.data.forEach((model) => {
          const option = document.createElement("option");
          option.value = model.id;
          option.textContent = model.name;
          modelSelect.appendChild(option);
        });
      } else {
        addErrorMessage("No models returned.");
      }
    } catch (error) {
      addErrorMessage("Error fetching models: " + error.message);
    }
  }

  // **Set Model**
  async function setModel(model) {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    try {
      const response = await fetch("http://127.0.0.1:3000/api/set-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model }),
      });
      const data = await response.json();
      if (data.success) {
        addInfoMessage("Model set successfully.");
      } else {
        addErrorMessage("Failed to set model: " + data.error);
      }
    } catch (error) {
      addErrorMessage("Error setting model: " + error.message);
    }
  }

  // **Fetch Chat History**
  async function fetchChatHistory(videoId) {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/chat-history/${videoId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      chatHistoryContainer.innerHTML = "";
      data.history.forEach((msg) => {
        addMessageToChat(msg.sender === "user" ? "You" : "AI", msg.message, msg.sender);
      });
    } catch (error) {
      addErrorMessage("Error fetching chat history: " + error.message);
    }
  }

  // **Fetch and Process Captions**
  async function fetchAndProcessCaptions() {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    if (captionsLoaded) return addInfoMessage("Captions already loaded.");

    addInfoMessage("Loading captions and video details...");
    loadCaptionsButton.disabled = true;
    loadCaptionsButton.textContent = "Loading...";

    const videoTitle = document.querySelector("title")?.textContent.trim() || "No title";
    const descriptionElement = document.querySelector("#description");
    const videoDescription = descriptionElement ? descriptionElement.textContent.trim() : "No description";
    const comments = Array.from(document.querySelectorAll("#content-text"))
      .slice(0, 15)
      .map((c) => c.textContent.trim());

    const playerJson = Array.from(document.scripts)
      .map((s) => s.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});(?:\s*var|$)/s)?.[1])
      .filter(Boolean)
      .map((txt) => JSON.parse(txt))[0];

    if (!playerJson) {
      addErrorMessage("No player response found.");
      resetLoadButton();
      return;
    }

    const tracks = playerJson.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (!tracks.length) {
      addErrorMessage("No captions available.");
      resetLoadButton();
      return;
    }

    const track = tracks.find((t) => t.languageCode === "en") || tracks[0];
    try {
      const res = await fetch(track.baseUrl);
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      const lines = Array.from(doc.querySelectorAll("text"))
        .map((n) => n.textContent.trim())
        .join(" ");
      videoTranscript = lines;
      captionsLoaded = true;

      const videoId = await sendDataToBackend(videoTitle, videoTranscript, videoDescription, comments);
      if (videoId) {
        window.currentYouTubeAIVideoId = videoId;
        addInfoMessage("Captions loaded and context sent to backend.");
        loadCaptionsButton.textContent = "Captions Loaded";
        fetchChatHistory(videoId);
      } else {
        resetLoadButton();
      }
    } catch (error) {
      addErrorMessage("Failed to fetch captions: " + error.message);
      resetLoadButton();
    }
  }

  function resetLoadButton() {
    loadCaptionsButton.disabled = false;
    loadCaptionsButton.textContent = "Load Captions";
  }

  // **Send Data to Backend**
  async function sendDataToBackend(title, transcript, description, comments) {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    try {
      const response = await fetch("http://127.0.0.1:3000/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, captions: transcript, description, comments }),
      });
      const data = await response.json();
      return data.success ? data.videoId : null;
    } catch (error) {
      addErrorMessage("Failed to send data to backend: " + error.message);
      return null;
    }
  }

  // **Get AI Response**
  async function getAIResponse(query) {
    const token = getToken();
    if (!token) return addErrorMessage("Please login first.");
    if (!window.currentYouTubeAIVideoId) return addErrorMessage("Video context not loaded.");

    addMessageToChat("AI", "Thinking...", "ai");
    try {
      const response = await fetch("http://127.0.0.1:3000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId: window.currentYouTubeAIVideoId, question: query }),
      });
      const data = await response.json();
      return data.answer || "No response from AI.";
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // **Handle Send Message**
  async function handleSendMessage() {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessageToChat("You", query, "user");
    chatInput.value = "";

    if (!captionsLoaded) {
      addErrorMessage("Please load captions first.");
      return;
    }

    const aiResponse = await getAIResponse(query);
    addMessageToChat("AI", aiResponse, "ai");
  }

  // **Reset for New Video**
  function resetForNewVideo() {
    videoTranscript = "";
    captionsLoaded = false;
    chatHistoryContainer.innerHTML = "";
    addMessageToChat("AI", "New video detected. Please login and load captions.", "ai", true);
    resetLoadButton();
    injectChatUI();
  }

  // **Observe View Mode Changes**
  function observeViewModeChanges() {
    const flexyElement = document.querySelector("ytd-watch-flexy");
    if (!flexyElement) return;

    if (viewModeObserver) viewModeObserver.disconnect();
    viewModeObserver = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === "theater" || m.attributeName === "fullscreen")) {
        setTimeout(resetForNewVideo, 200);
      }
    });
    viewModeObserver.observe(flexyElement, { attributes: true });
  }

  // **Initialize**
  async function initialize() {
    ensureChatUIElements();
    injectChatUI();
    observeViewModeChanges();
    document.addEventListener("yt-navigate-finish", () =>
      setTimeout(() => {
        resetForNewVideo();
        observeViewModeChanges();
      }, 500)
    );

    // Check for existing token and attempt auto-login
    if (getToken()) {
      const isValid = await verifyToken();
      if (!isValid) {
        addMessageToChat("AI", "Session expired. Please login again.", "ai", true);
      }
    }
  }

  // **Check Page Ready**
  const checkPageReady = () => {
    if (
      document.querySelector("ytd-watch-flexy div#secondary-inner") ||
      document.querySelector("ytd-watch-flexy div#primary-inner")
    ) {
      initialize();
    } else if (attempts++ < 50) {
      setTimeout(checkPageReady, 100);
    }
  };
  let attempts = 0;
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", checkPageReady)
    : checkPageReady();
})();