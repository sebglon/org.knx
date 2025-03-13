'use strict';

/**
 * This file contains common mocks for KNX tests.
 * It provides a consistent way to mock the KNX interface, KNX interface manager,
 * Homey app, and other dependencies across all driver tests.
 */

const homeyMocks = require('./homey-mocks');

// Mock the KNX interface
const createMockKNXInterface = () => ({
  readKNXGroupAddress: jest.fn().mockResolvedValue(),
  writeKNXGroupAddress: jest.fn().mockResolvedValue(),
  addKNXEventListener: jest.fn(),
  removeKNXEventListener: jest.fn(),
});

// Mock the KNX interface manager
const createMockKNXInterfaceManager = (mockKNXInterface) => ({
  getInterface: jest.fn().mockReturnValue(mockKNXInterface),
  getSimpleInterfaceList: jest.fn().mockResolvedValue([
    {
      id: 'test-interface',
      name: 'Test Interface',
      macAddress: '00:11:22:33:44:55',
    },
  ]),
  searchInterfaces: jest.fn().mockResolvedValue(),
  connectInterface: jest.fn().mockResolvedValue(),
  discoverKNXInterfaceOnIP: jest.fn().mockResolvedValue(),
  testGroupAddress: jest.fn().mockResolvedValue(),
});

// Mock the Homey app
const createMockApp = (mockKNXInterfaceManager) => ({
  getKNXInterfaceManager: jest.fn().mockReturnValue(mockKNXInterfaceManager),
  startLearnmodeSwitch: jest.fn().mockResolvedValue(),
});

// Mock the Homey settings
const createMockSettings = () => ({
  get: jest.fn(),
  set: jest.fn(),
});

// Mock the Homey session
const createMockSession = () => ({
  setHandler: jest.fn(),
});

/**
 * Setup all mocks for testing
 * @param {Object} options - Configuration options
 * @returns {Object} - Object containing all mocks
 */
const setupAllMocks = () => {
  // Create the mocks
  const mockKNXInterface = createMockKNXInterface();
  const mockKNXInterfaceManager = createMockKNXInterfaceManager(mockKNXInterface);
  const mockApp = createMockApp(mockKNXInterfaceManager);
  const mockSettings = createMockSettings();
  const mockSession = createMockSession();

  // Setup Homey mocks
  homeyMocks.setupHomeyMocks(mockApp);

  return {
    mockKNXInterface,
    mockKNXInterfaceManager,
    mockApp,
    mockSettings,
    mockSession,
  };
};

/**
 * Setup device mocks for testing
 * @param {Object} DeviceClass - The device class to test
 * @param {Object} options - Configuration options
 * @returns {Object} - Object containing the device instance and mocks
 */
const setupDeviceTest = (DeviceClass, options = {}) => {
  // Setup all mocks
  const mocks = setupAllMocks();
  
  // Create a new device instance
  const device = new DeviceClass();
  
  // Mock device settings
  const deviceSettings = {
    macAddress: '00:11:22:33:44:55',
    ...(options.settings || {}),
  };
  
  // Override the settings getter
  Object.defineProperty(device, 'settings', {
    get: jest.fn().mockReturnValue(deviceSettings),
    configurable: true,
  });
  
  // Set the KNX interface directly
  device.knxInterface = mocks.mockKNXInterface;
  
  return {
    device,
    mockKNXInterface: mocks.mockKNXInterface,
    mockKNXInterfaceManager: mocks.mockKNXInterfaceManager,
    mockApp: mocks.mockApp,
    mockSettings: deviceSettings,
    mockSession: mocks.mockSession,
  };
};

/**
 * Setup driver mocks for testing
 * @param {Object} DriverClass - The driver class to test
 * @param {Object} options - Configuration options
 * @returns {Object} - Object containing the driver instance and mocks
 */
const setupDriverTest = (DriverClass, options = {}) => {
  // Setup all mocks
  const mocks = setupAllMocks();
  
  // Create a new driver instance
  const driver = new DriverClass();
  
  // Set the app directly
  driver.homey.app = mocks.mockApp;
  
  // Initialize the driver if needed
  if (typeof driver.onInit === 'function') {
    driver.onInit();
  }
  
  return {
    driver,
    mockKNXInterface: mocks.mockKNXInterface,
    mockKNXInterfaceManager: mocks.mockKNXInterfaceManager,
    mockApp: mocks.mockApp,
    mockSettings: mocks.mockSettings,
    mockSession: mocks.mockSession,
  };
};

module.exports = {
  setupAllMocks,
  setupDeviceTest,
  setupDriverTest,
  createMockKNXInterface,
  createMockKNXInterfaceManager,
  createMockApp,
  createMockSettings,
  createMockSession,
};

// Add a dummy test to make Jest happy
if (process.env.NODE_ENV === 'test') {
  describe('KNX Mocks', () => {
    it('should export the required functions', () => {
      expect(setupAllMocks).toBeDefined();
      expect(setupDeviceTest).toBeDefined();
      expect(setupDriverTest).toBeDefined();
    });
  });
} 
