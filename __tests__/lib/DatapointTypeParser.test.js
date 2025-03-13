'use strict';

const DatapointTypeParser = require('../../lib/DatapointTypeParser');

describe('DatapointTypeParser', () => {
  describe('byteUnsigned', () => {
    it('should convert KNX value (0-255) to Homey value (0-1)', () => {
      // Create a buffer with value 0
      const buffer0 = Buffer.from([0]);
      expect(DatapointTypeParser.byteUnsigned(buffer0)).toBe(0);
      
      // Create a buffer with value 128
      const buffer128 = Buffer.from([128]);
      expect(DatapointTypeParser.byteUnsigned(buffer128)).toBe(128 / 255);
      
      // Create a buffer with value 255
      const buffer255 = Buffer.from([255]);
      expect(DatapointTypeParser.byteUnsigned(buffer255)).toBe(1);
    });
    
    it('should return default value if buffer is empty', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.byteUnsigned(emptyBuffer)).toBe(128);
      expect(DatapointTypeParser.byteUnsigned(emptyBuffer, 0)).toBe(0);
    });
  });
  
  describe('bitFormat', () => {
    it('should convert KNX bit value to boolean', () => {
      // Create a buffer with value 0
      const buffer0 = Buffer.from([0]);
      expect(DatapointTypeParser.bitFormat(buffer0)).toBe(false);
      
      // Create a buffer with value 1
      const buffer1 = Buffer.from([1]);
      expect(DatapointTypeParser.bitFormat(buffer1)).toBe(true);
    });
    
    it('should return default value if buffer is empty', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.bitFormat(emptyBuffer)).toBe(1);
      expect(DatapointTypeParser.bitFormat(emptyBuffer, 0)).toBe(0);
    });
  });

  describe('dim', () => {
    it('should convert KNX value (0-255) to Homey value (0-1)', () => {
      // Create a buffer with value 0
      const buffer0 = Buffer.from([0]);
      expect(DatapointTypeParser.dim(buffer0)).toBe(0);
      
      // Create a buffer with value 128
      const buffer128 = Buffer.from([128]);
      expect(DatapointTypeParser.dim(buffer128)).toBe(128 / 255);
      
      // Create a buffer with value 255
      const buffer255 = Buffer.from([255]);
      expect(DatapointTypeParser.dim(buffer255)).toBe(1);
    });
    
    it('should return default value if buffer is empty', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.dim(emptyBuffer)).toBe(128);
      expect(DatapointTypeParser.dim(emptyBuffer, 0)).toBe(0);
    });
  });

  describe('colorChannel', () => {
    it('should return the color channel value (0-255)', () => {
      // Create a buffer with value 0
      const buffer0 = Buffer.from([0]);
      expect(DatapointTypeParser.colorChannel(buffer0)).toBe(0);
      
      // Create a buffer with value 128
      const buffer128 = Buffer.from([128]);
      expect(DatapointTypeParser.colorChannel(buffer128)).toBe(128);
      
      // Create a buffer with value 255
      const buffer255 = Buffer.from([255]);
      expect(DatapointTypeParser.colorChannel(buffer255)).toBe(255);
    });
    
    it('should return default value if buffer is empty', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.colorChannel(emptyBuffer)).toBe(0);
      expect(DatapointTypeParser.colorChannel(emptyBuffer, 100)).toBe(100);
    });
  });

  describe('dpt9', () => {
    it('should correctly parse 2-byte float values', () => {
      // Test positive value: 25°C (0x0C 0xE2)
      const bufferPositive = Buffer.from([0x0C, 0xE2]);
      expect(DatapointTypeParser.dpt9(bufferPositive)).toBeCloseTo(25, 1);
      
      // Test negative value: -0.6°C (0x87, 0xC4)
      const bufferNegative = Buffer.from([0x87, 0xC4]);
      expect(DatapointTypeParser.dpt9(bufferNegative)).toBeCloseTo(-0.6, 1);
    });
    
    it('should return null if buffer is invalid', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.dpt9(emptyBuffer)).toBeNull();
      
      const invalidBuffer = Buffer.from([0x0C]);
      expect(DatapointTypeParser.dpt9(invalidBuffer)).toBeNull();
    });
  });

  describe('dpt17', () => {
    it('should return the scene number (0-255)', () => {
      // Create a buffer with value 0
      const buffer0 = Buffer.from([0]);
      expect(DatapointTypeParser.dpt17(buffer0)).toBe(0);
      
      // Create a buffer with value 5
      const buffer5 = Buffer.from([5]);
      expect(DatapointTypeParser.dpt17(buffer5)).toBe(5);
    });
    
    it('should return 0 if buffer is empty', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.dpt17(emptyBuffer)).toBe(0);
    });
  });

  describe('ldexp', () => {
    it('should correctly calculate 2^exp * mantissa', () => {
      expect(DatapointTypeParser.ldexp(1, 0)).toBe(1);
      expect(DatapointTypeParser.ldexp(1, 1)).toBe(2);
      expect(DatapointTypeParser.ldexp(1, 2)).toBe(4);
      expect(DatapointTypeParser.ldexp(2, 3)).toBe(16);
      expect(DatapointTypeParser.ldexp(-1, 2)).toBe(-4);
    });
    
    it('should handle extreme exponents', () => {
      // Test with exponent > 1023
      expect(DatapointTypeParser.ldexp(1, 1024)).toBeGreaterThan(0);
      
      // Test with exponent < -1074
      expect(DatapointTypeParser.ldexp(1, -1075)).toBeLessThan(Number.MIN_VALUE);
    });
  });

  describe('dpt20', () => {
    it('should convert KNX HVAC mode value to number', () => {
      // Create buffers with different HVAC mode values
      const buffer0 = Buffer.from([0]); // Auto
      expect(DatapointTypeParser.dpt20(buffer0)).toBe(0);
      
      const buffer1 = Buffer.from([1]); // Comfort
      expect(DatapointTypeParser.dpt20(buffer1)).toBe(1);
      
      const buffer2 = Buffer.from([2]); // Standby
      expect(DatapointTypeParser.dpt20(buffer2)).toBe(2);
      
      const buffer3 = Buffer.from([3]); // Economy
      expect(DatapointTypeParser.dpt20(buffer3)).toBe(3);
      
      const buffer4 = Buffer.from([4]); // Building Protection
      expect(DatapointTypeParser.dpt20(buffer4)).toBe(4);
    });
    
    it('should return default value if buffer is empty', () => {
      const emptyBuffer = Buffer.from([]);
      expect(DatapointTypeParser.dpt20(emptyBuffer)).toBe(0);
      expect(DatapointTypeParser.dpt20(emptyBuffer, 1)).toBe(1);
    });
  });
}); 
