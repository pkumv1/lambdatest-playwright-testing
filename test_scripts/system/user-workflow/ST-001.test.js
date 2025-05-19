/**
 * System test for complete search user workflow
 */
const { expect } = require('chai');
const { createBrowser, closeBrowser } = require('../../../utils/browser-factory');
const { buildCapabilities } = require('../../../utils/capabilities-builder');
const { reportTestStatus, takeScreenshot } = require('../../../utils/test-status');
const config = require('../../../test_config/config');

describe('ST-001: Complete User Workflow Test', function() {
  this.timeout(config.timeouts.test);
  
  // Skip tests if LambdaTest credentials are not available
  before(function() {
    if (!process.env.LT_USERNAME || !process.env.LT_ACCESS_KEY) {
      console.warn('Skipping LambdaTest system tests - credentials not available');
      this.skip();
    }
  });
  
  it('should perform a complete search workflow on DuckDuckGo', async function() {
    // Skip real connection tests in CI environments
    if (process.env.SKIP_EXTERNAL_CONNECTIONS) {
      this.skip();
      return;
    }
    
    let browser, page;
    
    try {
      // Build capabilities with browser and platform info
      const capabilities = buildCapabilities({
        browserName: 'Chrome',
        browserVersion: 'latest',
        platform: 'Windows 10',
        buildName: 'System Test Build',
        testName: 'DuckDuckGo Search Workflow',
        video: true,
        visual: true
      });
      
      // Connect to LambdaTest
      browser = await createBrowser({ capabilities });
      
      // Create a new page
      page = await browser.newPage();
      
      // Step 1: Navigate to DuckDuckGo
      console.log('Step 1: Navigating to DuckDuckGo');
      await page.goto(config.testUrls.search);
      
      // Take screenshot of initial page
      await takeScreenshot(page, { name: 'duckduckgo-homepage' });
      
      // Step 2: Search for "LambdaTest"
      console.log('Step 2: Performing search for LambdaTest');
      const searchBox = await page.locator('[name="q"]');
      await searchBox.click();
      await searchBox.type('LambdaTest Playwright Testing');
      
      // Take screenshot of typed search
      await takeScreenshot(page, { name: 'search-input-filled' });
      
      // Step 3: Submit search
      console.log('Step 3: Submitting search');
      await searchBox.press('Enter');
      
      // Wait for search results to load
      await page.waitForTimeout(3000);
      
      // Take screenshot of search results
      await takeScreenshot(page, { name: 'search-results' });
      
      // Step 4: Verify search results
      console.log('Step 4: Verifying search results');
      const title = await page.title();
      expect(title).to.include('LambdaTest');
      
      // Verify search results contain LambdaTest
      const resultElements = await page.locator('.result__title');
      const count = await resultElements.count();
      
      // Ensure we have search results
      expect(count).to.be.greaterThan(0);
      
      // Check if at least one result contains LambdaTest
      let foundLambdaTest = false;
      for (let i = 0; i < count && i < 10; i++) {
        const resultText = await resultElements.nth(i).textContent();
        if (resultText.includes('LambdaTest')) {
          foundLambdaTest = true;
          break;
        }
      }
      
      expect(foundLambdaTest).to.be.true;
      
      // Step 5: Click on a search result (if available)
      console.log('Step 5: Clicking on a search result');
      if (count > 0) {
        await resultElements.first().click();
        
        // Wait for page to load
        await page.waitForTimeout(5000);
        
        // Take screenshot of destination page
        await takeScreenshot(page, { name: 'destination-page' });
        
        // Verify we navigated away from search results
        const newUrl = page.url();
        expect(newUrl).to.not.include('duckduckgo.com/search');
      }
      
      // Report test success
      await reportTestStatus(page, 'passed', 'Successfully completed search workflow');
    } catch (error) {
      console.error('Test failed:', error);
      
      // Take screenshot on failure
      if (page) {
        await takeScreenshot(page, { name: 'test-failure' });
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
  
  it('should perform a todo app workflow test', async function() {
    // Skip real connection tests in CI environments
    if (process.env.SKIP_EXTERNAL_CONNECTIONS) {
      this.skip();
      return;
    }
    
    let browser, page;
    
    try {
      // Build capabilities
      const capabilities = buildCapabilities({
        browserName: 'Chrome',
        browserVersion: 'latest',
        platform: 'Windows 10',
        buildName: 'System Test Build',
        testName: 'Todo App Workflow Test',
        video: true
      });
      
      // Connect to LambdaTest
      browser = await createBrowser({ capabilities });
      
      // Create a new page
      page = await browser.newPage();
      
      // Step 1: Navigate to Todo app
      console.log('Step 1: Navigating to Todo app');
      await page.goto(config.testUrls.form);
      
      // Take screenshot of initial page
      await takeScreenshot(page, { name: 'todo-app-initial' });
      
      // Step 2: Add new todo items
      console.log('Step 2: Adding todo items');
      
      // Get the input field
      const inputField = await page.locator('input.form-control');
      
      // Add first todo item
      await inputField.click();
      await inputField.type('Complete system test');
      await page.locator('input[value="Add"]').click();
      
      // Add second todo item
      await inputField.click();
      await inputField.clear();
      await inputField.type('Verify todo functionality');
      await page.locator('input[value="Add"]').click();
      
      // Take screenshot after adding items
      await takeScreenshot(page, { name: 'todo-items-added' });
      
      // Step 3: Mark items as completed
      console.log('Step 3: Marking items as completed');
      
      // Get the list items
      const todoItems = await page.locator('body > div > div > div > ul > li');
      const count = await todoItems.count();
      
      // Verify we have the expected number of items
      expect(count).to.equal(5); // 3 default + 2 new ones
      
      // Check the first added item (index 3)
      await page.locator('body > div > div > div > ul > li:nth-child(4) input').click();
      
      // Take screenshot after marking item
      await takeScreenshot(page, { name: 'todo-item-completed' });
      
      // Step 4: Verify item is marked as completed
      console.log('Step 4: Verifying completed status');
      
      // Check if the item is marked as completed (has 'completed' class)
      const isCompleted = await page.locator('body > div > div > div > ul > li:nth-child(4)').getAttribute('class');
      expect(isCompleted).to.include('completed');
      
      // Report test success
      await reportTestStatus(page, 'passed', 'Successfully completed todo app workflow');
    } catch (error) {
      console.error('Test failed:', error);
      
      // Take screenshot on failure
      if (page) {
        await takeScreenshot(page, { name: 'test-failure' });
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
});
