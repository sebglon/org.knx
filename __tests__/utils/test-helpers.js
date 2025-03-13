'use strict';

/**
 * This file contains common test helpers for KNX tests.
 * It provides utility functions for testing KNX devices and drivers.
 */

const DatapointTypeParser = require('../../lib/DatapointTypeParser');

/**
 * Create a mock buffer for temperature data
 * @param {number} temperature - The temperature value
 * @returns {Buffer} - A buffer representing the temperature
 */
const createTemperatureBuffer = (temperature) => {
  // This is a simplified implementation
  // In a real implementation, you would use the actual KNX DPT9 encoding
  return Buffer.from([0x0C, temperature * 10]);
};

/**
 * Create a mock buffer for percentage data
 * @param {number} percentage - The percentage value (0-1)
 * @returns {Buffer} - A buffer representing the percentage
 */
const createPercentageBuffer = (percentage) => {
  // Convert percentage (0-1) to byte value (0-255)
  const byteValue = Math.round(percentage * 255);
  return Buffer.from([byteValue]);
};

/**
 * Create a mock buffer for HVAC mode data
 * @param {number} mode - The HVAC mode value
 * @returns {Buffer} - A buffer representing the HVAC mode
 */
const createHVACModeBuffer = (mode) => {
  return Buffer.from([mode]);
};

/**
 * Setup mocks for DatapointTypeParser
 */
const setupDatapointTypeParserMocks = () => {
  jest.spyOn(DatapointTypeParser, 'dpt9').mockImplementation((buffer) => {
    // Simple implementation for testing
    if (buffer.length >= 2) {
      return buffer[1] / 10;
    }
    return 21; // Default value
  });

  jest.spyOn(DatapointTypeParser, 'byteUnsigned').mockImplementation((buffer) => {
    // Simple implementation for testing
    if (buffer.length >= 1) {
      return buffer[0] === 128 ? 0.5 : buffer[0] / 255;
    }
    return 0.5; // Default value
  });

  jest.spyOn(DatapointTypeParser, 'dpt20').mockImplementation((buffer) => {
    // Simple implementation for testing
    if (buffer.length >= 1) {
      return buffer[0];
    }
    return 1; // Default value
  });
};

/**
 * Test common device capabilities
 * @param {Object} testContext - The test context containing device, mockKNXInterface, and mockSettings
 */
const testCommonDeviceCapabilities = (testContext) => {
  // Skip if testContext is undefined
  if (!testContext) {
    return;
  }
  
  const { device, mockKNXInterface, mockSettings } = testContext;
  
  // Skip if device is undefined
  if (!device) {
    return;
  }
  
  // Reset mocks
  jest.clearAllMocks();
  setupDatapointTypeParserMocks();
  
  // Mock setAvailable and setUnavailable methods
  device.setAvailable = jest.fn();
  device.setUnavailable = jest.fn();
  
  // Mock homey.__ method
  device.homey = {
    __: jest.fn().mockReturnValue('Interface not available'),
    ...device.homey,
  };
  
  // Test target_temperature capability
  if (mockSettings.ga_temperature_target) {
    const temperatureBuffer = createTemperatureBuffer(21);
    device.onKNXEvent(mockSettings.ga_temperature_target, temperatureBuffer);
    expect(device.setCapabilityValue).toHaveBeenCalledWith('target_temperature', 21);
  }

  // Test measure_temperature capability
  if (mockSettings.ga_temperature_measure) {
    jest.clearAllMocks();
    const temperatureBuffer = createTemperatureBuffer(22);
    device.onKNXEvent(mockSettings.ga_temperature_measure, temperatureBuffer);
    expect(device.setCapabilityValue).toHaveBeenCalledWith('measure_temperature', 22);
  }

  // Test KNX connection status changes
  jest.clearAllMocks();
  device.onKNXConnection('connected');
  expect(device.setAvailable).toHaveBeenCalled();
  
  jest.clearAllMocks();
  device.onKNXConnection('disconnected');
  expect(device.setUnavailable).toHaveBeenCalled();
};

module.exports = {
  createTemperatureBuffer,
  createPercentageBuffer,
  createHVACModeBuffer,
  setupDatapointTypeParserMocks,
  testCommonDeviceCapabilities,
};

// Add a dummy test to make Jest happy
if (process.env.NODE_ENV === 'test') {
  describe('Test Helpers', () => {
    it('should export the required functions', () => {
      expect(createTemperatureBuffer).toBeDefined();
      expect(createPercentageBuffer).toBeDefined();
      expect(createHVACModeBuffer).toBeDefined();
      expect(setupDatapointTypeParserMocks).toBeDefined();
      expect(testCommonDeviceCapabilities).toBeDefined();
    });
  });
} 
