module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'lib/**/*.js',
    'drivers/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  // Mock Homey's API
  moduleNameMapper: {
    '^homey$': '<rootDir>/__mocks__/homey.js',
  },
}; 
