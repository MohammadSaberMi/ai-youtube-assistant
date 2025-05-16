chrome.webRequest.onBeforeRequest.addListener(
  details => {
    if (details.url.includes('youtube.com/api/timedtext')) {
      console.log('Intercepted caption request:', details.url);
      // Allow the request to proceed
    }
  },
  { urls: ['https://*.youtube.com/api/timedtext*'] },
  ['requestBody']
);