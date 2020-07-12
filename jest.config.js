module.exports = {
  "testEnvironment": "node",
  "verbose": true,
  "testTimeout": 10000,
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*+(ts|tsx|js)",
    "!src/test/**/*.+(ts|tsx|js)",
    "!src/server.ts",
    "!src/config/mongodb.ts"
  ]
}
