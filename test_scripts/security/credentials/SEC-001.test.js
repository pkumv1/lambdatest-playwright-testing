/**
 * Security test for credential handling
 */
const { expect } = require('chai');
const { buildCapabilities } = require('../../../utils/capabilities-builder');
const { createBrowser, closeBrowser } = require('../../../utils/browser-factory');
const { reportTestStatus } = require('../../../utils/test-status');
const config = require('../../../test_config/config');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('SEC-001: Credential Security Verification', function() {
  this.timeout(config.timeouts.test);
  
  // Save original env vars
  const originalUsername = process.env.LT_USERNAME;
  const originalAccessKey = process.env.LT_ACCESS_KEY;
  
  before(function() {
    // Setup mock environment variables if not set
    if (!process.env.LT_USERNAME) {
      process.env.LT_USERNAME = 'test-username';
    }
    
    if (!process.env.LT_ACCESS_KEY) {
      process.env.LT_ACCESS_KEY = 'test-access-key';
    }
  });
  
  after(function() {
    // Restore original env vars
    process.env.LT_USERNAME = originalUsername;
    process.env.LT_ACCESS_KEY = originalAccessKey;
  });
  
  it('should not have hardcoded credentials in source files', function() {
    // Define the root directory to scan
    const rootDir = path.resolve(__dirname, '../../../');
    
    // Files to exclude (like this test file itself)
    const excludeFiles = [
      path.resolve(__dirname, 'SEC-001.test.js')
    ];
    
    // Patterns that might indicate hardcoded credentials
    const credentialPatterns = [
      /['"]LT_[A-Z0-9_]+['"]\s*[:=]\s*['"][A-Za-z0-9]+['"]/g, // 'LT_USERNAME': 'username'
      /['"]user['"]\s*[:=]\s*['"][^${}][A-Za-z0-9]+['"]/g, // 'user': 'username' (but not 'user': '${process.env.LT_USERNAME}')
      /['"]accessKey['"]\s*[:=]\s*['"][^${}][A-Za-z0-9]+['"]/g, // 'accessKey': 'key123'
      /['"]key['"]\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/g, // 'key': 'long-alphanumeric-string'
      /const\s+[a-zA-Z0-9_]+User\s*=\s*['"][A-Za-z0-9]+['"]/g, // const lambdaTestUser = 'username'
      /const\s+[a-zA-Z0-9_]+Key\s*=\s*['"][A-Za-z0-9]+['"]/g, // const accessKey = 'key123'
    ];
    
    // Suspicious files and their match contents
    const suspiciousFiles = [];
    
    // Recursive function to scan directory
    function scanDirectory(dir) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        // Skip excluded files
        if (excludeFiles.includes(filePath)) {
          continue;
        }
        
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          // Skip node_modules and .git directories
          if (file === 'node_modules' || file === '.git') {
            continue;
          }
          scanDirectory(filePath);
        } else if (stats.isFile()) {
          // Skip non-JavaScript/JSON files
          if (!filePath.endsWith('.js') && !filePath.endsWith('.json')) {
            continue;
          }
          
          // Read file content
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for credential patterns
          for (const pattern of credentialPatterns) {
            const matches = content.match(pattern);
            if (matches) {
              // Skip if matches are in comments
              const nonCommentMatches = matches.filter(match => {
                const matchIndex = content.indexOf(match);
                const lineStart = content.lastIndexOf('\n', matchIndex) + 1;
                const line = content.substring(lineStart, content.indexOf('\n', matchIndex));
                return !line.trim().startsWith('//') && !line.trim().startsWith('*');
              });
              
              if (nonCommentMatches.length > 0) {
                suspiciousFiles.push({
                  file: filePath.replace(rootDir, ''),
                  matches: nonCommentMatches
                });
              }
            }
          }
        }
      }
    }
    
    // Start scanning from root
    scanDirectory(rootDir);
    
    // Verify no suspicious files were found
    if (suspiciousFiles.length > 0) {
      console.log('Potential hardcoded credentials found:');
      suspiciousFiles.forEach(item => {
        console.log(`File: ${item.file}`);
        console.log(`Matches: ${item.matches.join(', ')}`);
      });
    }
    
    expect(suspiciousFiles).to.be.empty;
  });
  
  it('should use secure WebSocket connection for LambdaTest', function() {
    // Verify the WebSocket endpoint uses WSS (secure)
    const endpoint = config.cdpEndpoint;
    expect(endpoint).to.include('wss://');
    expect(endpoint).not.to.include('ws://');
  });
  
  it('should not log credentials during test execution', function() {
    // Create a custom logger to capture logs
    const logs = [];
    const originalConsoleLog = console.log;
    
    // Override console.log to capture logs
    console.log = function(...args) {
      logs.push(args.join(' '));
      originalConsoleLog.apply(console, args);
    };
    
    try {
      // Generate capabilities which might log credentials
      const capabilities = buildCapabilities({
        buildName: 'Security Test',
        testName: 'Credential Logging Test'
      });
      
      // Check if credentials were logged
      const username = process.env.LT_USERNAME;
      const accessKey = process.env.LT_ACCESS_KEY;
      
      // Look for credentials in logs
      const hasUsername = logs.some(log => log.includes(username));
      const hasAccessKey = logs.some(log => log.includes(accessKey));
      
      expect(hasUsername).to.be.false;
      expect(hasAccessKey).to.be.false;
      
      // Verify credentials are in the generated capabilities
      expect(capabilities['LT:Options'].user).to.equal(username);
      expect(capabilities['LT:Options'].accessKey).to.equal(accessKey);
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
    }
  });
  
  it('should verify secure credential transmission', async function() {
    // Skip this test in environments without network monitoring
    if (process.env.SKIP_EXTERNAL_CONNECTIONS) {
      this.skip();
      return;
    }
    
    let browser, page;
    let connectionLogs = [];
    
    try {
      // Create a method to capture network requests
      const captureRequests = (request) => {
        connectionLogs.push(request.url());
      };
      
      // Build capabilities
      const capabilities = buildCapabilities({
        buildName: 'Security Test',
        testName: 'Secure Credential Transmission Test'
      });
      
      // Connect to LambdaTest
      browser = await createBrowser({ capabilities });
      
      // Create a new page and monitor requests
      page = await browser.newPage();
      page.on('request', captureRequests);
      
      // Navigate to a test URL
      await page.goto(config.testUrls.search);
      
      // Perform a simple action to ensure the page loaded
      const title = await page.title();
      expect(title).to.not.be.empty;
      
      // Verify no plain-text credentials in any requests
      const username = process.env.LT_USERNAME;
      const accessKey = process.env.LT_ACCESS_KEY;
      
      // Look for credentials in request URLs
      const hasUsername = connectionLogs.some(url => 
        url.includes(username) && !url.includes(encodeURIComponent(username))
      );
      
      const hasAccessKey = connectionLogs.some(url => 
        url.includes(accessKey) && !url.includes(encodeURIComponent(accessKey))
      );
      
      expect(hasUsername).to.be.false;
      expect(hasAccessKey).to.be.false;
      
      // Report test success
      await reportTestStatus(page, 'passed', 'Successfully verified secure credential transmission');
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
});
