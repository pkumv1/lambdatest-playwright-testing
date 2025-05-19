/**
 * Integration test for Playwright with LambdaTest
 */
const { expect } = require('chai');
const { createBrowser, closeBrowser } = require('../../../utils/browser-factory');
const { buildCapabilities } = require('../../../utils/capabilities-builder');
const { reportTestStatus } = require('../../../utils/test-status');
const config = require('../../../test_config/config');

describe('IT-001: Playwright with LambdaTest Integration', function() {
  this.timeout(config.timeouts.test);
  
  // Skip tests if LambdaTest credentials are not available
  before(function() {
    if (!process.env.LT_USERNAME || !process.env.LT_ACCESS_KEY) {
      console.warn('Skipping LambdaTest integration tests - credentials not available');
      this.skip();
    }
  });
  
  it('should connect to LambdaTest and execute a simple browser action', async function() {
    // This is a real LambdaTest connection test, so we'll only run it if needed
    if (process.env.SKIP_EXTERNAL_CONNECTIONS) {
      this.skip();
      return;
    }
    
    let browser, page;
    
    try {
      // Build capabilities
      const capabilities = buildCapabilities({
        buildName: 'Integration Test Build',
        testName: 'LambdaTest Connection Test'
      });
      
      // Connect to LambdaTest
      browser = await createBrowser({ capabilities });
      
      // Create a new page
      page = await browser.newPage();
      
      // Navigate to a test URL
      await page.goto(config.testUrls.search);
      
      // Perform a simple action
      const title = await page.title();
      
      // Verify the action was successful
      expect(title).to.not.be.empty;
      
      // Report test success
      await reportTestStatus(page, 'passed', 'Successfully connected to LambdaTest and performed browser action');
    } catch (error) {
      // Report test failure if there was an error
      if (page) {
        await reportTestStatus(page, 'failed', `Test failed: ${error.message}`);
      }
      throw error;
    } finally {
      // Clean up resources
      if (browser || page) {
        await closeBrowser(page, browser);
      }
    }
  });
  
  it('should execute a search test on LambdaTest', async function() {
    // This is a real LambdaTest connection test, so we'll only run it if needed
    if (process.env.SKIP_EXTERNAL_CONNECTIONS) {
      this.skip();
      return;
    }
    
    let browser, page;
    
    try {
      // Build capabilities
      const capabilities = buildCapabilities({
        buildName: 'Integration Test Build',
        testName: 'Search Test'
      });
      
      // Connect to LambdaTest
      browser = await createBrowser({ capabilities });
      
      // Create a new page
      page = await browser.newPage();
      
      // Navigate to DuckDuckGo
      await page.goto(config.testUrls.search);
      
      // Type in the search box
      const searchBox = await page.locator('[name="q"]');
      await searchBox.click();
      await searchBox.type('LambdaTest');
      await searchBox.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(2000);
      
      // Get the title
      const title = await page.title();
      
      // Verify the search was successful
      expect(title).to.include('LambdaTest');
      
      // Report test success
      await reportTestStatus(page, 'passed', 'Successfully executed search test');
    } catch (error) {
      // Report test failure if there was an error
      if (page) {
        await reportTestStatus(page, 'failed', `Test failed: ${error.message}`);
      }
      throw error;
    } finally {
      // Clean up resources
      if (browser || page) {
        await closeBrowser(page, browser);
      }
    }
  });
  
  // For CI environments where we can't make actual LambdaTest connections,
  // we need a mock test that simulates the behavior
  it('should mock LambdaTest integration when real connection not possible', function() {
    // Mock the connection process
    const mockCapabilities = buildCapabilities({
      buildName: 'Mock Integration Test',
      testName: 'Mock Test'
    });
    
    // Verify the capabilities are properly formatted
    expect(mockCapabilities.browserName).to.equal('Chrome');
    expect(mockCapabilities['LT:Options'].build).to.equal('Mock Integration Test');
    expect(mockCapabilities['LT:Options'].name).to.equal('Mock Test');
    expect(mockCapabilities['LT:Options'].user).to.equal(process.env.LT_USERNAME);
    expect(mockCapabilities['LT:Options'].accessKey).to.equal(process.env.LT_ACCESS_KEY);
    
    // In a real environment, this would connect to LambdaTest
    // But for the mock test, we just verify the configuration
    
    // This test should pass even without making an actual connection
  });
});
