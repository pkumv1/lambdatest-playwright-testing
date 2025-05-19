/**
 * Main configuration file for the test framework
 */

require('dotenv').config();

module.exports = {
  // LambdaTest credentials
  username: process.env.LT_USERNAME,
  accessKey: process.env.LT_ACCESS_KEY,
  
  // LambdaTest CDP endpoint
  cdpEndpoint: 'wss://cdp.lambdatest.com/playwright',
  
  // Default build and test names
  defaultBuildName: 'Playwright Test Framework',
  defaultTestName: 'Playwright Test',
  
  // Browser configurations
  browsers: {
    chrome: {
      browserName: 'Chrome',
      browserVersion: 'latest'
    },
    edge: {
      browserName: 'MicrosoftEdge',
      browserVersion: 'latest'
    },
    firefox: {
      browserName: 'pw-firefox',
      browserVersion: 'latest'
    },
    webkit: {
      browserName: 'pw-webkit',
      browserVersion: 'latest'
    }
  },
  
  // Platform configurations
  platforms: {
    windows10: {
      platform: 'Windows 10'
    },
    macOSBigSur: {
      platform: 'MacOS Big sur'
    },
    macOSVentura: {
      platform: 'MacOS Ventura'
    }
  },
  
  // Timeouts in milliseconds
  timeouts: {
    connection: 30000,
    navigation: 30000,
    element: 10000,
    test: 300000
  },
  
  // Test URLs
  testUrls: {
    search: 'https://duckduckgo.com',
    form: 'https://lambdatest.github.io/sample-todo-app/'
  },
  
  // Report configuration
  reports: {
    outputDir: './results',
    htmlReport: true,
    jsonReport: true,
    screenshotsDir: './results/screenshots'
  }
};