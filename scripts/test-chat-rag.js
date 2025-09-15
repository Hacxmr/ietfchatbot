import { searchRFCContent, shouldUseRAG } from '../lib/rag/retrieval.js';

async function testChatIntegration() {
  console.log('🧪 Testing Chat API RAG Integration...\n');

  // Test queries that should trigger RAG
  const testQueries = [
    "What is DNS?",
    "How does HTTP work?",
    "Tell me about TCP/IP",
    "What are RFCs?",
    "How do I join a working group?"
  ];

  for (const query of testQueries) {
    console.log(`Testing query: "${query}"`);
    console.log(`   Should use RAG: ${shouldUseRAG(query)}`);

    if (shouldUseRAG(query)) {
      const result = await searchRFCContent(query, 3);
      if (result) {
        console.log(`    Found ${result.documents.length} relevant documents`);
        console.log(`    Sources: ${result.sources.map(s => s.rfcNumber).join(', ')}`);
        console.log(`    Context preview: ${result.context.substring(0, 200)}...`);
      } else {
        console.log('    No relevant content found');
      }
    }
    console.log('');
  }

  console.log('✅ Chat API RAG Integration test complete!');
}

// Run the test
testChatIntegration().catch(console.error);