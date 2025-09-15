#!/usr/bin/env node

// Quick initialization script for testing RAG system
// Processes just a few key RFCs and saves to backup

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
    console.log('✅ Environment variables loaded from .env.local');
  } else {
    console.warn('❌ .env.local file not found');
  }
} catch (error) {
  console.error('❌ Error loading environment variables:', error);
}

import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * Downloads RFC document text from the IETF website
 */
async function downloadRFC(rfcNumber: string | number): Promise<string> {
  const rfcNumberStr = rfcNumber.toString().padStart(4, '0');
  const url = `https://tools.ietf.org/rfc/rfc${rfcNumberStr}.txt`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download RFC ${rfcNumberStr}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Error downloading RFC ${rfcNumberStr}:`, error);
    throw error;
  }
}

/**
 * Extracts metadata from RFC content
 */
function extractRFCMetadata(content: string, rfcNumber: string | number): Record<string, string> {
  const rfcNumberStr = rfcNumber.toString();
  const metadata: Record<string, string> = {
    source: `RFC${rfcNumberStr}`,
    rfc: rfcNumberStr,
  };

  // Extract title
  const titleMatch = content.match(/(?:^\s*|\n\s*)Title:\s*([^\n]+)/i);
  if (titleMatch && titleMatch[1]) {
    metadata.title = titleMatch[1].trim();
  }

  return metadata;
}

/**
 * Splits RFC content into smaller chunks
 */
async function splitRFCContent(content: string, metadata: Record<string, string>): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", ""],
  });

  const docs = await splitter.createDocuments([content], [metadata]);

  return docs.map((doc, index) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        chunk: index + 1,
        source_id: `RFC${metadata.rfc}-${index + 1}`,
      },
    });
  });
}

/**
 * Process a single RFC
 */
async function processRFC(rfcNumber: string | number): Promise<Document[]> {
  console.log(`📥 Processing RFC ${rfcNumber}...`);

  const content = await downloadRFC(rfcNumber);
  const metadata = extractRFCMetadata(content, rfcNumber);
  const documents = await splitRFCContent(content, metadata);

  console.log(`✅ Processed RFC ${rfcNumber} into ${documents.length} chunks`);
  return documents;
}

async function quickInit() {
  console.log('Quick RFC initialization for testing...\n');

  // Just process a few key RFCs for testing
  const testRFCs = [1034, 1035, 2616]; // DNS, DNS, HTTP/1.1

  try {
    let allDocuments: Document[] = [];

    for (const rfcNumber of testRFCs) {
      try {
        const documents = await processRFC(rfcNumber);
        allDocuments = [...allDocuments, ...documents];
      } catch (error) {
        console.error(`❌ Error processing RFC ${rfcNumber}:`, error);
      }
    }

    console.log(`\nTotal documents processed: ${allDocuments.length}`);

    // Save to backup file
    const dataDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const backupPath = path.join(dataDir, 'rfc-documents-backup.json');
    const serialized = JSON.stringify(allDocuments, null, 2);
    fs.writeFileSync(backupPath, serialized);

    console.log(`💾 Backup saved to: ${backupPath}`);
    console.log('✅ Quick initialization complete!');
    console.log('You can now test the RAG system with DNS and HTTP questions.');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
  }
}

// Run the quick initialization
quickInit().catch(console.error);