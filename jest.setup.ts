// jest.setup.ts
import '@testing-library/jest-dom';

// Mock environment variables if needed
process.env.OPENAI_API_KEY = 'test-key';

// Suppress console output during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
