// Needed in VS Code 'Run All Tests' to work properly
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.test.ts$',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node']
};