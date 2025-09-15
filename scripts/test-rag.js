#!/usr/bin/env node

// Test script to verify RAG system functionality
// Run this after initializing the database to make sure everything works

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
    console.warn('.env.local file not found');
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
}

import { searchRFCContent, shouldUseRAG } from '../lib/rag/retrieval.ts';

async function testRAGSystem() {
  console.log('Testing RAG System...\n');

  // Test queries
  const testQueries = [
    'What is DNS?',
    'How does HTTP work?',
    'Tell me about TCP/IP',
    'What are RFCs?',
    'How do I join a working group?',
  ];

  for (const query of testQueries) {
    console.log(`Testing query: "${query}"`);
    console.log(`   Should use RAG: ${shouldUseRAG(query)}`);

    if (shouldUseRAG(query)) {
      try {
        const results = await searchRFCContent(query, 3);
        if (results) {
          console.log(`   Found ${results.documents.length} relevant documents`);
          console.log(`   Sources: ${results.sources.map(s => `RFC ${s.rfcNumber}`).join(', ')}`);
          console.log(`   Context preview: ${results.context.substring(0, 200)}...`);
        } else {
          console.log(`   No relevant documents found`);
        }
      } catch (error) {
        console.log(`   Error searching: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('RAG System test complete!');
}

// Run the test
testRAGSystem().catch(console.error);