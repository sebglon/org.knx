'use strict';

// Mock Homey API
const homeyMock = {
  // App class mock
  App: class App {
    constructor() {
      this.homey = homeyMock;
      this.log = jest.fn();
      this.error = jest.fn();
    }
  },
  
  // Device class mock
  Device: class Device {
    constructor() {
      this.log = jest.fn();
      this.error = jest.fn();
      this.setCapabilityValue = jest.fn().mockResolvedValue();
      this.getCapabilityValue = jest.fn();
      this.registerCapabilityListener = jest.fn();
      this.hasCapability = jest.fn().mockReturnValue(false);
      this.addCapability = jest.fn().mockResolvedValue();
      this.removeCapability = jest.fn().mockResolvedValue();
    }
  },
  
  // Driver class mock
  Driver: class Driver {
    constructor() {
      this.log = jest.fn();
      this.error = jest.fn();
    }
  },
  
  // Flow mocks
  flow: {
    getActionCard: jest.fn().mockReturnValue({
      registerRunListener: jest.fn(),
    }),
    getTriggerCard: jest.fn().mockReturnValue({
      registerRunListener: jest.fn(),
    }),
  },
  
  // i18n mock
  __: jest.fn().mockImplementation((key) => key),
};

module.exports = homeyMock; 
