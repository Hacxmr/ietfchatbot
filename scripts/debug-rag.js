#!/usr/bin/env node

// Debug script to test individual components
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

async function debugRAG() {
  console.log('\n🧪 Testing RAG components...\n');

  // Test 1: Check API keys
  console.log('1. Testing API keys...');
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  console.log(`   OPENAI_API_KEY: ${openaiKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`   OPENROUTER_API_KEY: ${openrouterKey ? '✅ Present' : '❌ Missing'}`);

  if (!openaiKey && !openrouterKey) {
    console.error('❌ No API keys found. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in .env.local');
    return;
  }

  // Test 2: Test embeddings creation
  console.log('\n2. Testing embeddings creation...');
  try {
    const { OpenAIEmbeddings } = await import('@langchain/openai');
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openaiKey || openrouterKey,
      modelName: "text-embedding-3-small",
      stripNewLines: false,
      dimensions: 1536,
    });
    console.log('✅ Embeddings model created successfully');

    // Test 3: Test embedding a simple text
    console.log('\n3. Testing text embedding...');
    const testText = "This is a test document about RFCs.";
    const embedding = await embeddings.embedQuery(testText);
    console.log(`✅ Successfully embedded text (${embedding.length} dimensions)`);

    // Test 4: Test ChromaDB connection
    console.log('\n4. Testing ChromaDB connection...');
    const { Chroma } = await import('@langchain/community/vectorstores/chroma');
    const { Document } = await import('langchain/document');

    const testDoc = new Document({
      pageContent: testText,
      metadata: { test: true }
    });

    try {
      const vectorStore = await Chroma.fromDocuments([testDoc], embeddings, {
        collectionName: "test_collection",
        url: "http://localhost:8000",
      });
      console.log('✅ ChromaDB connection successful');

      // Test 5: Test similarity search
      console.log('\n5. Testing similarity search...');
      const results = await vectorStore.similaritySearch("test document", 1);
      console.log(`✅ Similarity search successful (${results.length} results)`);

    } catch (chromaError) {
      console.warn('Warning: ChromaDB connection failed:', chromaError.message);
      console.log('Note: ChromaDB is not running. For persistent storage, start it with:');
      console.log('   docker run -p 8000:8000 chromadb/chroma');
    }

  } catch (error) {
    console.error('❌ Error testing embeddings:', error.message);
  }

  console.log('\n✅ Debug test complete!');
}

// Run the debug test
debugRAG().catch(console.error);