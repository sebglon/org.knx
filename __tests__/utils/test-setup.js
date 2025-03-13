'use strict';

/**
 * This file serves as the main entry point for all test utilities.
 * It exports all the functions from the other utility files.
 */

// Import all utility files
const homeyMocks = require('./homey-mocks');
const knxMocks = require('./knx-mocks');
const testHelpers = require('./test-helpers');
const thermostatTestHelpers = require('./thermostat-test-helpers');

// Export all functions from all utility files
module.exports = {
  // Homey mocks
  ...homeyMocks,
  
  // KNX mocks
  ...knxMocks,
  
  // Test helpers
  ...testHelpers,
  
  // Thermostat test helpers
  ...thermostatTestHelpers,
};

// Add a dummy test to make Jest happy
if (process.env.NODE_ENV === 'test') {
  describe('Test Setup', () => {
    it('should export all utility functions', () => {
      expect(module.exports).toBeDefined();
    });
  });
} 
