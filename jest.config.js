module.exports = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.js"],   // Looks in __tests__ folder
    setupFiles: ["./jest.setup.js"]              // Loads env before tests
};
