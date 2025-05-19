/**
 * Utility to report test status to LambdaTest
 */

/**
 * Report test status to LambdaTest
 * @param {Object} page - Playwright page instance
 * @param {string} status - Test status ('passed' or 'failed')
 * @param {string} remark - Additional information about the test result
 * @returns {Promise<void>}
 */
async function reportTestStatus(page, status, remark) {
  if (!page) {
    console.error('Page instance not provided for status reporting');
    return;
  }
  
  try {
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
      action: 'setTestStatus',
      arguments: { status, remark }
    })}`);
  } catch (error) {
    console.error('Failed to report test status to LambdaTest:', error);
    throw error;
  }
}

/**
 * Take a screenshot using LambdaTest SmartUI
 * @param {Object} page - Playwright page instance
 * @param {Object} options - Screenshot options
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, options = {}) {
  if (!page) {
    console.error('Page instance not provided for screenshot');
    return;
  }
  
  const screenshotName = options.name || `screenshot-${Date.now()}`;
  const fullPage = options.fullPage !== undefined ? options.fullPage : true;
  const cssSelector = options.cssSelector || null;
  
  try {
    const args = { 
      fullPage, 
      screenshotName 
    };
    
    if (cssSelector) {
      args.selectDOM = { cssSelector: Array.isArray(cssSelector) ? cssSelector : [cssSelector] };
    }
    
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({
      action: 'smartui.takeScreenshot',
      arguments: args
    })}`);
  } catch (error) {
    console.error('Failed to take screenshot using LambdaTest SmartUI:', error);
    throw error;
  }
}

module.exports = {
  reportTestStatus,
  takeScreenshot
};