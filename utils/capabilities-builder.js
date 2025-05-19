/**
 * Utility to build LambdaTest capabilities configuration
 */

const cp = require('child_process');

/**
 * Get the current Playwright version
 * @returns {string} Playwright version
 */
function getPlaywrightVersion() {
  try {
    return cp.execSync('npx playwright --version').toString().trim().split(' ')[1];
  } catch (error) {
    console.error('Error getting Playwright version:', error);
    return 'unknown';
  }
}

/**
 * Build capabilities configuration for LambdaTest
 * @param {Object} options - Capabilities options
 * @returns {Object} Capabilities configuration object
 */
function buildCapabilities(options = {}) {
  // Get required configuration
  const browserName = options.browserName || 'Chrome';
  const browserVersion = options.browserVersion || 'latest';
  const platform = options.platform || 'Windows 10';
  
  // Get optional parameters with defaults
  const buildName = options.buildName || 'Playwright Test Build';
  const testName = options.testName || 'Playwright Test';
  const network = options.network !== undefined ? options.network : true;
  const video = options.video !== undefined ? options.video : true;
  const console = options.console !== undefined ? options.console : true;
  const visual = options.visual !== undefined ? options.visual : false;
  const tunnel = options.tunnel || false;
  const tunnelName = options.tunnelName || '';
  const geoLocation = options.geoLocation || '';
  
  // Ensure username and access key are provided
  if (!process.env.LT_USERNAME || !process.env.LT_ACCESS_KEY) {
    throw new Error('LambdaTest username and access key must be set in environment variables');
  }
  
  // Build capabilities object
  return {
    'browserName': browserName,
    'browserVersion': browserVersion,
    'LT:Options': {
      'platform': platform,
      'build': buildName,
      'name': testName,
      'user': process.env.LT_USERNAME,
      'accessKey': process.env.LT_ACCESS_KEY,
      'network': network,
      'video': video,
      'console': console,
      'visual': visual,
      'tunnel': tunnel,
      'tunnelName': tunnelName,
      'geoLocation': geoLocation,
      'playwrightClientVersion': getPlaywrightVersion()
    }
  };
}

module.exports = {
  buildCapabilities,
  getPlaywrightVersion
};