// This script initializes the RFC database by fetching and processing important RFCs
// It's meant to be run via ts-node

// List of important RFCs to include in our knowledge base
export const IMPORTANT_RFCS = [
  // Core DNS RFCs
  1034, 1035,  // Domain Names - concepts and implementation
  
  // HTTP RFCs
  2616,        // HTTP/1.1 (original)
  7230, 7231, 7232, 7233, 7234, 7235, // HTTP/1.1 updated
  9110, 9111, 9112, 9113, 9114, // HTTP Semantics and other parts
  
  // TCP/IP RFCs
  791, 793,    // IP and TCP
  
  // TLS RFCs
  8446,        // TLS 1.3
  
  // Email RFCs
  5321, 5322,  // SMTP and Internet Message Format
  
  // Working Group Process
  2026,        // The Internet Standards Process
  2418,        // IETF Working Group Guidelines and Procedures
  
  // IPv6 RFCs
  8200,        // IPv6
  
  // BGP RFCs
  4271,        // Border Gateway Protocol 4
  
  // DHCP RFCs
  2131,        // DHCP
  
  // QUIC RFCs
  9000, 9001, 9002, // QUIC Transport Protocol
];

import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import fs from 'fs';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
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

/**
 * Downloads RFC document text from the IETF website
 * @param rfcNumber RFC number to download
 * @returns The RFC content as string
 */
export async function downloadRFC(rfcNumber: string | number): Promise<string> {
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
 * @param content RFC document content
 * @param rfcNumber RFC number
 * @returns Metadata object
 */
export function extractRFCMetadata(content: string, rfcNumber: string | number): Record<string, string> {
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
  
  // Extract authors
  const authorMatch = content.match(/(?:^\s*|\n\s*)Author(?:s)?:\s*([^\n]+(?:\n\s+[^\n]+)*)/i);
  if (authorMatch && authorMatch[1]) {
    metadata.author = authorMatch[1].replace(/\s+/g, ' ').trim();
  }
  
  // Extract status
  const statusMatch = content.match(/(?:^\s*|\n\s*)Status(?:\s+of)?(?:\s+this)?(?:\s+Memo)?:\s*([^\n]+)/i);
  if (statusMatch && statusMatch[1]) {
    metadata.status = statusMatch[1].trim();
  }
  
  // Extract date
  const dateMatch = content.match(/(?:^\s*|\n\s*)Date:\s*([^\n]+)/i);
  if (dateMatch && dateMatch[1]) {
    metadata.date = dateMatch[1].trim();
  }
  
  // Extract category if available
  const categoryMatch = content.match(/(?:^\s*|\n\s*)Category:\s*([^\n]+)/i);
  if (categoryMatch && categoryMatch[1]) {
    metadata.category = categoryMatch[1].trim();
  }
  
  return metadata;
}

/**
 * Splits RFC content into smaller chunks for vector storage
 * @param content RFC document content
 * @param metadata Metadata to attach to each chunk
 * @returns Array of Document objects
 */
export async function splitRFCContent(content: string, metadata: Record<string, string>): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", ""],
  });
  
  const docs = await splitter.createDocuments([content], [metadata]);
  
  // Add page numbers to help with citations
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
 * Downloads, processes and splits an RFC document
 * @param rfcNumber RFC number to process
 * @returns Array of Document objects ready for embedding
 */
export async function processRFC(rfcNumber: string | number): Promise<Document[]> {
  console.log(`Processing RFC ${rfcNumber}...`);
  
  const content = await downloadRFC(rfcNumber);
  const metadata = extractRFCMetadata(content, rfcNumber);
  const documents = await splitRFCContent(content, metadata);
  
  console.log(`Processed RFC ${rfcNumber} into ${documents.length} chunks`);
  return documents;
}

/**
 * Processes a list of RFCs in batch
 * @param rfcNumbers Array of RFC numbers to process
 * @returns Array of Document objects from all RFCs
 */
export async function processMultipleRFCs(rfcNumbers: (string | number)[]): Promise<Document[]> {
  let allDocuments: Document[] = [];
  
  for (const rfcNumber of rfcNumbers) {
    try {
      const documents = await processRFC(rfcNumber);
      allDocuments = [...allDocuments, ...documents];
    } catch (error) {
      console.error(`Error processing RFC ${rfcNumber}:`, error);
      // Continue with next RFC
    }
  }
  
  return allDocuments;
}

/**
 * Create embeddings model based on environment configuration
 */
function createEmbeddings() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY or OPENROUTER_API_KEY environment variable.');
  }
  
  return new OpenAIEmbeddings({
    openAIApiKey: apiKey,
    modelName: "text-embedding-3-small", // More affordable, good quality
    stripNewLines: false,
    dimensions: 1536, // Using consistent dimensionality
  });
}

/**
 * Save a backup of vector embeddings to a file
 * Useful for development when we want to avoid re-embedding
 * @param documents Documents to back up
 * @param filePath Path to save the backup
 */
function saveEmbeddingsBackup(documents: Document[], filePath: string) {
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const serialized = JSON.stringify(documents, null, 2);
  fs.writeFileSync(filePath, serialized);
  console.log(`Saved backup to ${filePath}`);
}

/**
 * Initialize the RFC database by downloading, processing and storing important RFCs
 */
async function initializeRFCDatabase() {
  console.log(` Starting initialization of RFC database with ${IMPORTANT_RFCS.length} RFCs...`);
  console.log(` RFCs to be processed: ${IMPORTANT_RFCS.join(', ')}\n`);

  try {
    // Check if we have API keys
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('Missing API key. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in .env.local');
    }
    console.log(' API key found');

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(' Created .data directory');
    }

    console.log(' Starting RFC processing...');
    // Process all RFCs in our list
    const documents = await processMultipleRFCs(IMPORTANT_RFCS);
    console.log(`\n Successfully processed ${documents.length} chunks from ${IMPORTANT_RFCS.length} RFCs`);

    // Save a backup of the documents
    const backupPath = path.join(process.cwd(), '.data', 'rfc-documents-backup.json');
    saveEmbeddingsBackup(documents, backupPath);

    console.log(' Creating vector embeddings...');
    // Create vector store
    const embeddings = createEmbeddings();
    console.log(' Embeddings model created');

    try {
      const vectorStore = await Chroma.fromDocuments(documents, embeddings, {
        collectionName: "rfc_documents",
        url: "http://localhost:8000", // Default ChromaDB URL
        collectionMetadata: {
          "description": "IETF RFC documents for retrieval",
          "updated_at": new Date().toISOString(),
        },
      });

      console.log(' RFC database initialization complete!');
      console.log(` Total documents stored: ${documents.length}`);
      console.log(` Backup saved to: ${backupPath}`);
    } catch (chromaError) {
      console.warn('  ChromaDB connection failed, using in-memory store for now:', chromaError instanceof Error ? chromaError.message : String(chromaError));
      console.log(' To use persistent storage, start ChromaDB server: docker run -p 8000:8000 chromadb/chroma');

      // Create in-memory store as fallback
      const vectorStore = await Chroma.fromDocuments(documents, embeddings, {
        collectionName: "rfc_documents",
      });

      console.log(' RFC database initialization complete (in-memory)!');
      console.log(` Total documents stored: ${documents.length}`);
      console.log(` Backup saved to: ${backupPath}`);
      console.log('  Note: Data will not persist between restarts. Start ChromaDB for persistent storage.');
    }

  } catch (error) {
    console.error(' Error initializing RFC database:', error);
    throw error;
  }
}

// Execute the initialization function when this script is run directly
// For ES modules, we need to check if this is the main module differently
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  console.log(` RFCs to be processed:`, IMPORTANT_RFCS.join(', '));
  initializeRFCDatabase()
    .then(() => {
      console.log(' Initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error(' Initialization failed:', error);
      process.exit(1);
    });
}