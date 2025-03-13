'use strict';

/**
 * This file contains all Homey-related mocks for testing.
 * It provides a consistent way to mock the Homey API across all tests.
 */

/**
 * Setup Homey mocks for testing
 * @param {Object} mockApp - The mock Homey app
 */
const setupHomeyMocks = (mockApp) => {
  // Create mock classes
  const mockHomeyDevice = class Device {
    constructor() {
      this.log = jest.fn();
      this.error = jest.fn();
      this.setAvailable = jest.fn();
      this.setUnavailable = jest.fn();
      this.getName = jest.fn().mockReturnValue('Test Device');
      this.getData = jest.fn().mockReturnValue({ id: 'test-device-id' });
      this.setCapabilityValue = jest.fn().mockResolvedValue();
      this.registerCapabilityListener = jest.fn();
      this.hasCapability = jest.fn().mockReturnValue(true);
      this.addCapability = jest.fn().mockResolvedValue();
      this.removeCapability = jest.fn().mockResolvedValue();
      
      // Mock app
      this.app = mockApp;
      
      // Mock homey
      this.homey = {
        __: jest.fn().mockImplementation((key) => key),
        app: mockApp,
        settings: {
          get: jest.fn(),
          set: jest.fn(),
        },
      };
    }
  };

  const mockHomeyDriver = class Driver {
    constructor() {
      this.log = jest.fn();
      this.error = jest.fn();
      this.homey = {
        __: jest.fn().mockImplementation((key) => key),
        app: mockApp,
        settings: {
          get: jest.fn(),
          set: jest.fn(),
        },
      };
    }
  };

  const mockHomeyApp = jest.fn();

  // Setup the mock
  jest.mock('homey', () => {
    return {
      App: mockHomeyApp,
      Device: mockHomeyDevice,
      Driver: mockHomeyDriver,
    };
  }, { virtual: true });
};

module.exports = {
  setupHomeyMocks,
};

// Add a dummy test to make Jest happy
if (process.env.NODE_ENV === 'test') {
  describe('Homey Mocks', () => {
    it('should export the required functions', () => {
      expect(setupHomeyMocks).toBeDefined();
    });
  });
} 
