/**
 * Unit test for capabilities builder utility
 */
const { expect } = require('chai');
const { buildCapabilities, getPlaywrightVersion } = require('../../../utils/capabilities-builder');

describe('UC-002: Verify Capabilities Configuration Builder', function() {
  // Save original env vars
  const originalUsername = process.env.LT_USERNAME;
  const originalAccessKey = process.env.LT_ACCESS_KEY;
  
  before(function() {
    // Setup mock environment variables
    process.env.LT_USERNAME = 'test-username';
    process.env.LT_ACCESS_KEY = 'test-access-key';
  });
  
  after(function() {
    // Restore original env vars
    process.env.LT_USERNAME = originalUsername;
    process.env.LT_ACCESS_KEY = originalAccessKey;
  });
  
  it('should create capabilities with default values', function() {
    const capabilities = buildCapabilities();
    
    // Verify required parameters
    expect(capabilities.browserName).to.equal('Chrome');
    expect(capabilities.browserVersion).to.equal('latest');
    expect(capabilities['LT:Options'].platform).to.equal('Windows 10');
    
    // Verify credentials
    expect(capabilities['LT:Options'].user).to.equal('test-username');
    expect(capabilities['LT:Options'].accessKey).to.equal('test-access-key');
    
    // Verify default values for optional parameters
    expect(capabilities['LT:Options'].build).to.equal('Playwright Test Build');
    expect(capabilities['LT:Options'].name).to.equal('Playwright Test');
    expect(capabilities['LT:Options'].network).to.equal(true);
    expect(capabilities['LT:Options'].video).to.equal(true);
    expect(capabilities['LT:Options'].console).to.equal(true);
    expect(capabilities['LT:Options'].tunnel).to.equal(false);
    expect(capabilities['LT:Options'].tunnelName).to.equal('');
    expect(capabilities['LT:Options'].geoLocation).to.equal('');
  });
  
  it('should override default values with provided options', function() {
    const options = {
      browserName: 'MicrosoftEdge',
      browserVersion: '110',
      platform: 'MacOS Ventura',
      buildName: 'Custom Build',
      testName: 'Custom Test',
      network: false,
      video: false,
      console: false,
      visual: true,
      tunnel: true,
      tunnelName: 'my-tunnel',
      geoLocation: 'US'
    };
    
    const capabilities = buildCapabilities(options);
    
    // Verify custom parameters
    expect(capabilities.browserName).to.equal('MicrosoftEdge');
    expect(capabilities.browserVersion).to.equal('110');
    expect(capabilities['LT:Options'].platform).to.equal('MacOS Ventura');
    expect(capabilities['LT:Options'].build).to.equal('Custom Build');
    expect(capabilities['LT:Options'].name).to.equal('Custom Test');
    expect(capabilities['LT:Options'].network).to.equal(false);
    expect(capabilities['LT:Options'].video).to.equal(false);
    expect(capabilities['LT:Options'].console).to.equal(false);
    expect(capabilities['LT:Options'].visual).to.equal(true);
    expect(capabilities['LT:Options'].tunnel).to.equal(true);
    expect(capabilities['LT:Options'].tunnelName).to.equal('my-tunnel');
    expect(capabilities['LT:Options'].geoLocation).to.equal('US');
  });
  
  it('should throw error if credentials are not set', function() {
    // Temporarily remove env vars
    delete process.env.LT_USERNAME;
    delete process.env.LT_ACCESS_KEY;
    
    // Expect function to throw
    expect(() => buildCapabilities()).to.throw('LambdaTest username and access key must be set in environment variables');
    
    // Restore mock env vars
    process.env.LT_USERNAME = 'test-username';
    process.env.LT_ACCESS_KEY = 'test-access-key';
  });
  
  it('should include Playwright version in capabilities', function() {
    const capabilities = buildCapabilities();
    
    // Verify Playwright version is set
    expect(capabilities['LT:Options'].playwrightClientVersion).to.not.be.undefined;
    
    // The value might be 'unknown' in the test environment if Playwright is not installed,
    // so we're just checking it exists rather than a specific value
  });
});
