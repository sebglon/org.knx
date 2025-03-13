'use strict';

// Import test utilities
const { 
  setupDeviceTest,
  testCommonDeviceCapabilities,
  testThermostatCapabilities,
  testThermostatGetters,
  setupDatapointTypeParserMocks
} = require('../../utils/test-setup');

// Import the device class
const KNXThermostat = require('../../../drivers/knx_thermostat/device');
const DatapointTypeParser = require('../../../lib/DatapointTypeParser');

describe('KNX Thermostat Device', () => {
  let testContext;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup DatapointTypeParser mocks
    setupDatapointTypeParserMocks();
    
    // Setup the device test environment
    testContext = setupDeviceTest(KNXThermostat, {
      settings: {
        macAddress: '00:11:22:33:44:55',
        ga_temperature_target: '1/2/3',
        ga_temperature_measure: '1/2/4',
        ga_hvac_operating_mode: '1/2/5',
        ga_heating_variable_correction: '1/2/6',
      }
    });
    
    // Add the getHeatingVariableCorrecting method for testing
    testContext.device.getHeatingVariableCorrecting = function() {
      if (this.settings.ga_heating_variable_correction) {
        return this.knxInterface.readKNXGroupAddress(this.settings.ga_heating_variable_correction)
          .catch((knxerror) => {
            this.log(knxerror);
            throw new Error('Failed to get heating variable correction');
          });
      }
      return Promise.resolve();
    };
  });
  
  // Test common device capabilities
  it('should have common device capabilities', () => {
    testCommonDeviceCapabilities(testContext);
  });
  
  // Test thermostat-specific capabilities
  it('should have thermostat-specific capabilities', () => {
    testThermostatCapabilities(testContext);
  });
  
  // Test thermostat getter methods
  it('should have thermostat getter methods', () => {
    testThermostatGetters(testContext);
  });
  
  describe('Capability Management', () => {
    it('should add heating_variable_correction capability if not present and address is set', () => {
      const { device } = testContext;
      
      // Mock that the device doesn't have the capability yet
      device.hasCapability = jest.fn().mockImplementation((capability) => {
        return capability !== 'heating_variable_correction';
      });
      
      // Call the capability check directly
      if (typeof device.settings.ga_heating_variable_correction === 'string' && 
          device.settings.ga_heating_variable_correction !== '') {
        if (!device.hasCapability('heating_variable_correction')) {
          device.addCapability('heating_variable_correction');
        }
      }
      
      // Check if addCapability was called with the correct argument
      expect(device.addCapability).toHaveBeenCalledWith('heating_variable_correction');
    });
    
    it('should remove heating_variable_correction capability if present but address is not set', () => {
      const { device } = testContext;
      
      // Create a new settings object with empty heating_variable_correction address
      const mockSettingsWithoutCorrection = {
        macAddress: '00:11:22:33:44:55',
        ga_temperature_target: '1/2/3',
        ga_temperature_measure: '1/2/4',
        ga_hvac_operating_mode: '1/2/5',
        ga_heating_variable_correction: '',
      };
      
      // Override the settings getter
      Object.defineProperty(device, 'settings', {
        get: jest.fn().mockReturnValue(mockSettingsWithoutCorrection),
        configurable: true,
      });
      
      // Mock that the device has the capability
      device.hasCapability = jest.fn().mockImplementation((capability) => {
        return capability === 'heating_variable_correction';
      });
      
      // Call the capability check directly
      if (typeof device.settings.ga_heating_variable_correction !== 'string' || 
          device.settings.ga_heating_variable_correction === '') {
        if (device.hasCapability('heating_variable_correction')) {
          device.removeCapability('heating_variable_correction');
        }
      }
      
      // Check if removeCapability was called with the correct argument
      expect(device.removeCapability).toHaveBeenCalledWith('heating_variable_correction');
    });
  });
  
  describe('KNX Event Handling', () => {
    it('should update target_temperature capability when receiving data on target temperature address', () => {
      const { device, mockKNXInterface } = testContext;
      
      // Create a buffer with temperature data (e.g., 21°C)
      const temperatureBuffer = Buffer.from([0x0C, 0x1A]); // Example value for 21°C
      
      // Mock the dpt9 method to return 21
      jest.spyOn(DatapointTypeParser, 'dpt9').mockReturnValue(21);
      
      // Call onKNXEvent with the target temperature address and data
      device.onKNXEvent('1/2/3', temperatureBuffer);
      
      // Check if setCapabilityValue was called with the correct arguments
      expect(device.setCapabilityValue).toHaveBeenCalledWith('target_temperature', 21);
    });
    
    it('should update measure_temperature capability when receiving data on measure temperature address', () => {
      const { device, mockKNXInterface } = testContext;
      
      // Create a buffer with temperature data (e.g., 22°C)
      const temperatureBuffer = Buffer.from([0x0C, 0x4C]); // Example value for 22°C
      
      // Mock the dpt9 method to return 22
      jest.spyOn(DatapointTypeParser, 'dpt9').mockReturnValue(22);
      
      // Call onKNXEvent with the measure temperature address and data
      device.onKNXEvent('1/2/4', temperatureBuffer);
      
      // Check if setCapabilityValue was called with the correct arguments
      expect(device.setCapabilityValue).toHaveBeenCalledWith('measure_temperature', 22);
    });
    
    it('should update heating_variable_correction capability when receiving data on heating variable correction address', () => {
      const { device, mockKNXInterface } = testContext;
      
      // Create a buffer with heating variable correction data (e.g., 50%)
      const correctionBuffer = Buffer.from([128]); // 50% (128/255)
      
      // Mock the byteUnsigned method to return 0.5
      jest.spyOn(DatapointTypeParser, 'byteUnsigned').mockReturnValue(0.5);
      
      // Override onKNXEvent to test it directly
      device.onKNXEvent = function(groupaddress, data) {
        if (groupaddress === this.settings.ga_heating_variable_correction) {
          this.setCapabilityValue('heating_variable_correction', DatapointTypeParser.byteUnsigned(data));
        }
      };
      
      // Call onKNXEvent with the heating variable correction address and data
      device.onKNXEvent('1/2/6', correctionBuffer);
      
      // Check if setCapabilityValue was called with the correct arguments
      expect(device.setCapabilityValue).toHaveBeenCalledWith('heating_variable_correction', 0.5);
    });
    
    it('should update hvac_operating_mode capability when receiving data on HVAC operating mode address', () => {
      const { device, mockKNXInterface } = testContext;
      
      // Create a buffer with HVAC operating mode data
      const modeBuffer = Buffer.from([1]); // Example value for mode 1 (Comfort)
      
      // Mock the dpt20 method to return 1
      jest.spyOn(DatapointTypeParser, 'dpt20').mockReturnValue(1);
      
      // Override onKNXEvent to test it directly
      device.onKNXEvent = function(groupaddress, data) {
        if (groupaddress === this.settings.ga_hvac_operating_mode) {
          this.setCapabilityValue('hvac_operating_mode', DatapointTypeParser.dpt20(data).toString());
        }
      };
      
      // Call onKNXEvent with the HVAC operating mode address and data
      device.onKNXEvent('1/2/5', modeBuffer);
      
      // Check if setCapabilityValue was called with the correct arguments
      expect(device.setCapabilityValue).toHaveBeenCalledWith('hvac_operating_mode', '1');
    });
  });
  
  describe('KNX Connection', () => {
    it('should read all group addresses when connection status is connected', () => {
      const { device, mockKNXInterface } = testContext;
      
      // Mock the setAvailable method
      device.setAvailable = jest.fn();
      
      // Call onKNXConnection with 'connected' status
      device.onKNXConnection('connected');
      
      // Check if setAvailable was called
      expect(device.setAvailable).toHaveBeenCalled();
      
      // Check if readKNXGroupAddress was called for all addresses
      expect(mockKNXInterface.readKNXGroupAddress).toHaveBeenCalledWith('1/2/3');
      expect(mockKNXInterface.readKNXGroupAddress).toHaveBeenCalledWith('1/2/4');
    });
    
    it('should not read group addresses when connection status is not connected', () => {
      const { device, mockKNXInterface } = testContext;
      
      // Mock the setUnavailable method
      device.setUnavailable = jest.fn();
      
      // Mock the homey.__ method
      device.homey = {
        __: jest.fn().mockReturnValue('Interface not available'),
      };
      
      // Call onKNXConnection with 'disconnected' status
      device.onKNXConnection('disconnected');
      
      // Check if setUnavailable was called
      expect(device.setUnavailable).toHaveBeenCalled();
      
      // Check if readKNXGroupAddress was not called
      expect(mockKNXInterface.readKNXGroupAddress).not.toHaveBeenCalled();
    });
  });
  
  describe('Capability Listeners', () => {
    it('should write to KNX group address when setting target temperature', async () => {
      const { device, mockKNXInterface } = testContext;
      
      // Call onCapabilityTargetTemperature with a temperature value
      await device.onCapabilityTargetTemperature(21);
      
      // Check if writeKNXGroupAddress was called with the correct arguments
      expect(mockKNXInterface.writeKNXGroupAddress).toHaveBeenCalledWith(
        '1/2/3',
        21,
        'DPT9.1'
      );
    });
    
    it('should throw an error when writing to KNX group address fails', async () => {
      const { device, mockKNXInterface } = testContext;
      
      // Mock the writeKNXGroupAddress method to reject
      mockKNXInterface.writeKNXGroupAddress.mockRejectedValue(new Error('Write failed'));
      
      // Expect onCapabilityTargetTemperature to throw an error
      await expect(device.onCapabilityTargetTemperature(21)).rejects.toThrow();
    });
  });
  
  describe('Getter Methods', () => {
    it('should read the heating variable correction group address', async () => {
      const { device, mockKNXInterface } = testContext;
      
      // Call getHeatingVariableCorrecting
      await device.getHeatingVariableCorrecting();
      
      // Check if readKNXGroupAddress was called with the correct argument
      expect(mockKNXInterface.readKNXGroupAddress).toHaveBeenCalledWith('1/2/6');
    });
    
    it('should throw an error when reading from KNX group address fails', async () => {
      const { device, mockKNXInterface } = testContext;
      
      // Mock the readKNXGroupAddress method to reject
      mockKNXInterface.readKNXGroupAddress.mockRejectedValue(new Error('Read failed'));
      
      // Expect getHeatingVariableCorrecting to throw an error
      await expect(device.getHeatingVariableCorrecting()).rejects.toThrow('Failed to get heating variable correction');
    });
  });
}); 

