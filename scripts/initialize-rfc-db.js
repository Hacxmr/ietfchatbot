#!/usr/bin/env node

// This script initializes the RFC database by fetching and processing important RFCs
// It's meant to be run from the command line before starting the application

// Use CommonJS require for the init script
const { execSync } = require('child_process');

console.log('Starting RFC database initialization...');
console.log('WARNING: This may take a while depending on the number of RFCs to process.');

try {
  // Execute the TypeScript file directly using ts-node
  execSync('npx ts-node --esm -P tsconfig.json scripts/init-db.ts', { 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  
  console.log('RFC database initialization complete!');
  process.exit(0);
} catch (error) {
  console.error('Error initializing RFC database:', error);
  process.exit(1);
}