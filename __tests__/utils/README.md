# KNX Test Utilities

This directory contains utilities for testing KNX devices and drivers. These utilities provide a consistent way to mock the KNX interface, KNX interface manager, Homey app, and other dependencies across all driver tests.

## Files

- `test-setup.js`: Main entry point for all test utilities. Import this file to access all test utilities.
- `homey-mocks.js`: Contains mocks for the Homey API, including Device, Driver, and App classes.
- `knx-mocks.js`: Contains mocks for the KNX interface, KNX interface manager, and other KNX-related dependencies.
- `test-helpers.js`: Contains utility functions for testing KNX devices and drivers.
- `thermostat-test-helpers.js`: Contains thermostat-specific utility functions for testing KNX thermostat devices and drivers.

## Usage

### Basic Device Test

```javascript
'use strict';

// Import test utilities
const { setupDeviceTest } = require('../../utils/test-setup');

// Import the device class
const KNXDevice = require('../../../drivers/knx_device/device');

describe('KNX Device', () => {
  let testContext;
  
  beforeEach(() => {
    // Setup the device test environment
    testContext = setupDeviceTest(KNXDevice, {
      settings: {
        macAddress: '00:11:22:33:44:55',
        // Add device-specific settings here
      }
    });
  });
  
  // Add your tests here
  it('should initialize correctly', () => {
    const { device } = testContext;
    expect(device).toBeDefined();
  });
});
```

### Basic Driver Test

```javascript
'use strict';

// Import test utilities
const { setupDriverTest } = require('../../utils/test-setup');

// Import the driver class
const KNXDriver = require('../../../drivers/knx_device/driver');

describe('KNX Driver', () => {
  let testContext;
  
  beforeEach(() => {
    // Setup the driver test environment
    testContext = setupDriverTest(KNXDriver);
  });
  
  // Add your tests here
  it('should initialize correctly', () => {
    const { driver } = testContext;
    expect(driver).toBeDefined();
  });
});
```

## Utility Functions

### Homey Mocks

- `createMockHomeyDevice(mockApp)`: Creates a mock Homey Device class.
- `createMockHomeyDriver(mockApp)`: Creates a mock Homey Driver class.
- `createMockHomeyApp()`: Creates a mock Homey App class.
- `setupHomeyMocks(mockApp)`: Sets up all Homey mocks.

### KNX Mocks

- `createMockKNXInterface()`: Creates a mock KNX interface.
- `createMockKNXInterfaceManager(mockKNXInterface)`: Creates a mock KNX interface manager.
- `createMockApp(mockKNXInterfaceManager)`: Creates a mock Homey app.
- `createMockSettings()`: Creates mock Homey settings.
- `createMockSession()`: Creates a mock Homey session.
- `setupAllMocks()`: Sets up all mocks (Homey and KNX).
- `setupDeviceTest(DeviceClass, options)`: Sets up a device test environment.
- `setupDriverTest(DriverClass, options)`: Sets up a driver test environment.

### Test Helpers

- `createTemperatureBuffer(temperature)`: Creates a mock buffer for temperature data.
- `createPercentageBuffer(percentage)`: Creates a mock buffer for percentage data.
- `createHVACModeBuffer(mode)`: Creates a mock buffer for HVAC mode data.
- `setupDatapointTypeParserMocks()`: Sets up mocks for the DatapointTypeParser.
- `testCommonDeviceCapabilities(testContext)`: Tests common device capabilities.

### Thermostat Test Helpers

- `testThermostatCapabilities(testContext)`: Tests thermostat-specific capabilities.
- `testThermostatGetters(testContext)`: Tests thermostat getter methods.

## Example: Using the Utilities

```javascript
'use strict';

// Import test utilities
const { 
  setupDeviceTest,
  testCommonDeviceCapabilities,
  testThermostatCapabilities,
  testThermostatGetters
} = require('../../utils/test-setup');

// Import the device class
const KNXThermostat = require('../../../drivers/knx_thermostat/device');

describe('KNX Thermostat Device', () => {
  let testContext;
  
  beforeEach(() => {
    // Setup the device test environment
    testContext = setupDeviceTest(KNXThermostat, {
      settings: {
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
  testCommonDeviceCapabilities(testContext);
  
  // Test thermostat-specific capabilities
  testThermostatCapabilities(testContext);
  
  // Test thermostat getter methods
  testThermostatGetters(testContext);
  
  // Add your custom tests here
});
```

## Notes

- The utilities are designed to be used with Jest.
- The utilities are designed to be used with the KNX device and driver classes.
- The utilities are designed to be used with the Homey API.
- The utilities are designed to be used with the KNX interface and KNX interface manager.
- The utilities are designed to be used with the DatapointTypeParser.
