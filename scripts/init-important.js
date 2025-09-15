#!/usr/bin/env node

// Script to initialize important RFCs (critical + important)
// Run this for a good balance between comprehensiveness and speed

import fs from 'fs';
import path from 'path';

// Manual loading of environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n');

    for (const line of envVars) {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match && !match[1].startsWith('#')) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    console.log('Environment variables loaded from .env.local');
  } else {
    console.warn('WARNING: .env.local file not found');
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
}

import { initializeRFCDatabase } from '../lib/rag/init-database.ts';

console.log('IMPORTANT RFC INITIALIZATION');
console.log('This will process critical + important internet protocols.\n');

// Initialize with important priority
initializeRFCDatabase('important').catch(error => {
  console.error('Fatal error during important initialization:', error);
  process.exit(1);
});