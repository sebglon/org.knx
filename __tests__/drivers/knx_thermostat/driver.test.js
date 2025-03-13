'use strict';

// Mock the KNX interface
const mockKNXInterface = {
  readKNXGroupAddress: jest.fn().mockResolvedValue(),
  writeKNXGroupAddress: jest.fn().mockResolvedValue(),
  addKNXEventListener: jest.fn(),
  removeKNXEventListener: jest.fn(),
};

// Mock the KNX interface manager
const mockKNXInterfaceManager = {
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
};

// Mock the Homey app
const mockApp = {
  getKNXInterfaceManager: jest.fn().mockReturnValue(mockKNXInterfaceManager),
  startLearnmodeSwitch: jest.fn().mockResolvedValue(),
};

// Mock the Homey settings
const mockSettings = {
  get: jest.fn(),
  set: jest.fn(),
};

// Mock the Homey session
const mockSession = {
  setHandler: jest.fn(),
};

// Mock the Homey API
jest.mock('homey', () => {
  return {
    App: jest.fn(),
    Driver: class Driver {
      constructor() {
        this.log = jest.fn();
        this.error = jest.fn();
        this.homey = {
          __: jest.fn().mockImplementation((key) => key),
          app: mockApp,
          settings: mockSettings,
        };
      }
    },
  };
});

const KNXThermostatDriver = require('../../../drivers/knx_thermostat/driver');

describe('KNX Thermostat Driver', () => {
  let driver;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new driver instance
    driver = new KNXThermostatDriver();
    
    // Set the app directly
    driver.homey.app = mockApp;
    
    // Initialize the driver
    driver.onInit();
  });
  
  describe('onPair', () => {
    it('should set up handlers for the pairing process', async () => {
      // Call onPair with the mock session
      await driver.onPair(mockSession);
      
      // Check if setHandler was called for all the expected handlers
      expect(mockSession.setHandler).toHaveBeenCalledWith('get_uuid', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('list_interfaces', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('search_interfaces', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('manual_ip_address', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('selected_interface', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('return_selected_interface', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('checks_existing_groupaddresses', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('uploaded_groupaddresses', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('list_etsimport', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('learnmode', expect.any(Function));
      expect(mockSession.setHandler).toHaveBeenCalledWith('test_groupaddress', expect.any(Function));
    });
    
    it('should handle list_interfaces correctly', async () => {
      // Call onPair with the mock session
      await driver.onPair(mockSession);
      
      // Get the handler function
      const listInterfacesHandler = mockSession.setHandler.mock.calls.find(
        call => call[0] === 'list_interfaces'
      )[1];
      
      // Call the handler
      const result = await listInterfacesHandler();
      
      // Check if the result is as expected
      expect(result).toEqual([
        {
          id: 'test-interface',
          name: 'Test Interface',
          macAddress: '00:11:22:33:44:55',
        },
      ]);
      
      // Check if getSimpleInterfaceList was called
      expect(mockKNXInterfaceManager.getSimpleInterfaceList).toHaveBeenCalled();
    });
    
    it('should handle search_interfaces correctly', async () => {
      // Call onPair with the mock session
      await driver.onPair(mockSession);
      
      // Get the handler function
      const searchInterfacesHandler = mockSession.setHandler.mock.calls.find(
        call => call[0] === 'search_interfaces'
      )[1];
      
      // Call the handler
      const result = await searchInterfacesHandler();
      
      // Check if the result is as expected
      expect(result).toEqual([
        {
          id: 'test-interface',
          name: 'Test Interface',
          macAddress: '00:11:22:33:44:55',
        },
      ]);
      
      // Check if searchInterfaces was called
      expect(mockKNXInterfaceManager.searchInterfaces).toHaveBeenCalled();
      expect(mockKNXInterfaceManager.getSimpleInterfaceList).toHaveBeenCalled();
    });
  });
}); 
