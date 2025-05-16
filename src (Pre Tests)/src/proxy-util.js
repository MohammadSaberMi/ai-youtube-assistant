const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Detect Windows system proxy settings
 * @returns {string|null} - The proxy URL or null if no proxy is configured
 */
function detectWindowsSystemProxy() {
  try {
    // Try to get proxy settings from Windows registry
    const regQuery = execSync(
      'reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    
    // Check if proxy is enabled (value should be 0x1)
    const isProxyEnabled = regQuery.includes('0x1');
    
    if (!isProxyEnabled) {
      console.log('Windows proxy is disabled in system settings');
      return null;
    }
    
    // Get proxy server address
    const proxyServerQuery = execSync(
      'reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    
    // Extract proxy address from registry output
    const proxyMatch = proxyServerQuery.match(/ProxyServer\s+REG_SZ\s+(.*)/);
    if (proxyMatch && proxyMatch[1]) {
      const proxyServer = proxyMatch[1].trim();
      
      // Check if it's already in URL format or just host:port
      if (proxyServer.startsWith('http')) {
        console.log(`Using Windows system proxy: ${proxyServer}`);
        return proxyServer;
      } else {
        // If it's just host:port, prepend http://
        console.log(`Using Windows system proxy: http://${proxyServer}`);
        return `http://${proxyServer}`;
      }
    }
  } catch (error) {
    console.log('Error detecting Windows system proxy:', error.message);
  }
  
  return null;
}

/**
 * Creates a fetch function that routes requests through a proxy
 * @param {string} proxyUrl - The proxy URL (e.g., 'http://localhost:8080' or 'socks5://localhost:1080')
 * @returns {Function} - A fetch function that uses the proxy
 */
function createProxyFetch(proxyUrl) {
  if (!proxyUrl) {
    console.log('No proxy URL specified, using direct connection');
    return fetch;
  }
  
  console.log(`Using proxy: ${proxyUrl}`);
  
  let agent;
  if (proxyUrl.startsWith('socks')) {
    agent = new SocksProxyAgent(proxyUrl);
  } else {
    agent = new HttpsProxyAgent(proxyUrl);
  }
  
  // Return a custom fetch function that uses the proxy
  return (url, options = {}) => {
    return fetch(url, {
      ...options,
      agent,
    });
  };
}

/**
 * Get the appropriate fetch function based on environment variables or system settings
 * @param {boolean} useSystemProxy - Whether to use system proxy settings
 * @returns {Function} - A fetch function
 */
function getProxyAwareFetch(useSystemProxy = true) {
  // First check environment variables
  let proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  
  // If no environment proxy and useSystemProxy is true, try to detect Windows system proxy
  if (!proxyUrl && useSystemProxy && process.platform === 'win32') {
    proxyUrl = detectWindowsSystemProxy();
  }
  
  return createProxyFetch(proxyUrl);
}

/**
 * Configure fetch options with reasonable defaults
 * @param {Object} additionalOptions - Extra options to add
 * @returns {Object} - Complete fetch options
 */
function getDefaultFetchOptions(additionalOptions = {}) {
  return {
    timeout: 15000, // 15 seconds timeout
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    ...additionalOptions
  };
}

/**
 * Fetch with retry and proxy support
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries
 * @param {number} backoff - Initial backoff in ms
 * @param {boolean} useSystemProxy - Whether to use system proxy settings
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 300, useSystemProxy = true) {
  const proxyFetch = getProxyAwareFetch(useSystemProxy);
  const fetchOptions = getDefaultFetchOptions(options);
  
  try {
    return await proxyFetch(url, fetchOptions);
  } catch (err) {
    if (retries <= 0) throw err;
    
    console.log(`Fetch failed, retrying in ${backoff}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    
    return fetchWithRetry(url, options, retries - 1, backoff * 2, useSystemProxy);
  }
}

module.exports = {
  createProxyFetch,
  getProxyAwareFetch,
  getDefaultFetchOptions,
  fetchWithRetry,
  detectWindowsSystemProxy
}; 