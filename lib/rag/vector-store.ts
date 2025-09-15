import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import fs from 'fs';
import { Document } from 'langchain/document';
import path from 'path';

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Create embeddings model based on environment configuration
 */
export function createEmbeddings() {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY or OPENROUTER_API_KEY environment variable.');
  }
  
  return new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
    modelName: "text-embedding-3-small", // More affordable, good quality
    stripNewLines: false,
    dimensions: 1536, // Using consistent dimensionality
  });
}

/**
 * Create or get the vector store instance for RFC documents
 * @param documents Optional documents to add on initialization
 */
export async function getRFCVectorStore(documents?: Document[]) {
  const embeddings = createEmbeddings();
  const collectionName = "rfc_documents";
  
  // Path for persistent storage
  const dbPath = path.join(DATA_DIR, 'chroma');
  
  if (documents && documents.length > 0) {
    // If documents are provided, create/update the collection
    return await Chroma.fromDocuments(documents, embeddings, {
      collectionName,
      url: "http://localhost:8000", // Default ChromaDB URL, will work with local instance
      collectionMetadata: {
        "description": "IETF RFC documents for retrieval",
        "updated_at": new Date().toISOString(),
      },
    });
  } else {
    // Otherwise, just open the existing collection
    return await Chroma.fromExistingCollection(embeddings, { 
      collectionName,
      url: "http://localhost:8000", // Default ChromaDB URL
    });
  }
}

/**
 * Add RFC documents to vector store
 * @param documents Documents to add to the vector store
 */
export async function addDocumentsToVectorStore(documents: Document[]) {
  if (documents.length === 0) return;
  
  const vectorStore = await getRFCVectorStore();
  await vectorStore.addDocuments(documents);
  console.log(`Added ${documents.length} documents to vector store.`);
  
  return vectorStore;
}

/**
 * Save a backup of vector embeddings to a file
 * Useful for development when we want to avoid re-embedding
 * @param documents Documents to back up
 * @param filePath Path to save the backup
 */
export function saveEmbeddingsBackup(documents: Document[], filePath: string) {
  const serialized = JSON.stringify(documents, null, 2);
  fs.writeFileSync(filePath, serialized);
}

/**
 * Load embeddings backup from a file
 * @param filePath Path to load the backup from
 */
export function loadEmbeddingsBackup(filePath: string): Document[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const serialized = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(serialized);
}