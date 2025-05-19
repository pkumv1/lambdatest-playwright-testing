/**
 * Factory for creating browser instances with LambdaTest integration
 */

const { chromium, firefox, webkit } = require('playwright');
const capabilitiesBuilder = require('./capabilities-builder');

/**
 * Connect to LambdaTest and create a browser instance
 * @param {Object} options - Browser connection options
 * @returns {Promise<Object>} Browser instance
 */
async function createBrowser(options = {}) {
  // Build capabilities for LambdaTest
  const capabilities = options.capabilities || capabilitiesBuilder.buildCapabilities(options);
  
  // Determine which browser engine to use
  const browserType = getBrowserType(capabilities.browserName);
  
  // Encode capabilities for the WebSocket endpoint
  const encodedCapabilities = encodeURIComponent(JSON.stringify(capabilities));
  
  // Connect to LambdaTest CDP endpoint
  try {
    const browser = await browserType.connect({
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodedCapabilities}`
    });
    
    return browser;
  } catch (error) {
    console.error('Failed to connect to LambdaTest:', error);
    throw error;
  }
}

/**
 * Get the appropriate browser type based on browser name
 * @param {string} browserName - Name of the browser
 * @returns {Object} Playwright browser type
 */
function getBrowserType(browserName) {
  const lowerBrowserName = (browserName || '').toLowerCase();
  
  if (lowerBrowserName.includes('firefox')) {
    return firefox;
  } else if (lowerBrowserName.includes('webkit') || lowerBrowserName.includes('safari')) {
    return webkit;
  } else {
    // Default to chromium for Chrome, Edge, and other Chromium-based browsers
    return chromium;
  }
}

/**
 * Close browser and page instances properly
 * @param {Object} page - Playwright page instance
 * @param {Object} browser - Playwright browser instance
 * @returns {Promise<void>}
 */
async function closeBrowser(page, browser) {
  try {
    if (page && !page.isClosed()) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  } catch (error) {
    console.error('Error during browser cleanup:', error);
  }
}

module.exports = {
  createBrowser,
  closeBrowser,
  getBrowserType
};