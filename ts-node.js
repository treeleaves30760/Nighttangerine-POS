// This file allows knex to work with TypeScript files
const { register } = require('ts-node');

// Register TypeScript
register({
  project: './tsconfig.json',
  transpileOnly: true,
});

// Export the TypeScript knexfile
module.exports = require('./knexfile.ts').default;