# LambdaTest Playwright Testing Framework

A comprehensive testing framework for validating Playwright integration with LambdaTest cloud platform.

## Structure

- `/test_cases/`: Test case specifications organized by test type
- `/test_scripts/`: Executable test code organized by test framework/language
- `/test_config/`: Configuration files for different environments
- `/test_data/`: Test fixtures and mock data
- `/results/`: Test execution reports and logs
- `/utils/`: Utility functions and helpers

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- LambdaTest account

### Installation

```bash
# Clone the repository
git clone https://github.com/pkumv1/lambdatest-playwright-testing.git
cd lambdatest-playwright-testing

# Install dependencies
npm install
```

### Configuration

Set your LambdaTest credentials in the environment variables:

```bash
# For Windows
set LT_USERNAME="YOUR_LAMBDATEST_USERNAME"
set LT_ACCESS_KEY="YOUR_LAMBDATEST_ACCESS_KEY"

# For macOS/Linux
export LT_USERNAME="YOUR_LAMBDATEST_USERNAME"
export LT_ACCESS_KEY="YOUR_LAMBDATEST_ACCESS_KEY"
```

## Running Tests

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run system tests
npm run test:system

# Run all tests
npm test
```

## Test Reports

Test reports will be generated in the `/results` directory after test execution. HTML reports provide detailed test results with screenshots and logs.

## Contributing

Contributions are welcome! Please follow the established code style and add unit tests for any new or changed functionality.

## License

MIT