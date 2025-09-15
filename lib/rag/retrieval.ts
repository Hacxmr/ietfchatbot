import { OpenAIEmbeddings } from '@langchain/openai';
import fs from 'fs';
import { Document } from 'langchain/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import path from 'path';

// Global variable to store the vector store
let rfcVectorStore: MemoryVectorStore | null = null;

/**
 * Create embeddings model based on environment configuration
 */
export function createEmbeddings() {
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
 * Get or create the RFC vector store instance
 */
export async function getRFCVectorStore(): Promise<MemoryVectorStore> {
  if (rfcVectorStore) {
    return rfcVectorStore;
  }

  const embeddings = createEmbeddings();

  // Check if we have a backup file
  const backupPath = path.join(process.cwd(), '.data', 'rfc-documents-backup.json');
  if (fs.existsSync(backupPath)) {
    console.log('Loading RFC documents from backup file...');
    try {
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      console.log(`Loaded ${backupData.length} documents from backup`);

      // Create in-memory vector store from backup
      rfcVectorStore = await MemoryVectorStore.fromDocuments(backupData, embeddings);
      console.log(' RFC vector store created from backup');
      return rfcVectorStore;
    } catch (backupError) {
      console.error('Failed to load backup file:', backupError instanceof Error ? backupError.message : String(backupError));
    }
  }

  // Create empty in-memory store
  console.warn('Creating empty in-memory vector store. Run initialization script to populate with RFCs.');
  rfcVectorStore = new MemoryVectorStore(embeddings);
  return rfcVectorStore;
}

export interface RetrievedContext {
  documents: Document[];
  context: string;
  sources: {
    title?: string;
    rfcNumber: string;
    chunk: number;
  }[];
}

/**
 * Search for relevant RFC content based on user query
 * @param query User question or message
 * @param topK Number of results to retrieve (default: 5)
 * @returns Retrieved documents and formatted context
 */
export async function searchRFCContent(query: string, topK: number = 5): Promise<RetrievedContext | null> {
  try {
    const vectorStore = await getRFCVectorStore();
    const results = await vectorStore.similaritySearch(query, topK);

    if (!results || results.length === 0) {
      console.log('No relevant RFC content found for query:', query);
      return null;
    }

    // Extract unique sources for citation
    const sources = results.map((doc: Document) => ({
      rfcNumber: doc.metadata.rfc,
      title: doc.metadata.title,
      chunk: doc.metadata.chunk,
    }));

    // Format the context for inclusion in the prompt
    const formattedContext = formatRetrievedContext(results);

    return {
      documents: results,
      context: formattedContext,
      sources,
    };
  } catch (error) {
    console.error('Error searching RFC content:', error);
    return null;
  }
}

/**
 * Format retrieved documents into a single context string
 * @param documents Retrieved documents
 * @returns Formatted context string
 */
function formatRetrievedContext(documents: Document[]): string {
  // Group documents by RFC
  const groupedByRFC = documents.reduce((groups: Record<string, Document[]>, doc) => {
    const rfcNum = doc.metadata.rfc;
    if (!groups[rfcNum]) {
      groups[rfcNum] = [];
    }
    groups[rfcNum].push(doc);
    return groups;
  }, {});

  // Format each RFC section
  const formattedSections = Object.entries(groupedByRFC).map(([rfcNum, docs]) => {
    const title = docs[0].metadata.title || `RFC ${rfcNum}`;

    // Sort documents by chunk number to maintain order
    docs.sort((a, b) => a.metadata.chunk - b.metadata.chunk);

    const content = docs.map(doc => doc.pageContent).join('\n\n');

    return `## RFC ${rfcNum}: ${title}\n\n${content}`;
  });

  return formattedSections.join('\n\n---\n\n');
}

/**
 * Create a system prompt with retrieved RFC context
 * @param audience User audience type
 * @param retrievedContext Context retrieved from vector database
 * @returns System prompt string with context
 */
export function createRAGPrompt(audience: string, retrievedContext: RetrievedContext): string {
  // Base system prompt template
  const baseSystemPrompt = `You are an expert IETF (Internet Engineering Task Force) assistant. You help users understand internet standards, RFCs, working groups, and IETF processes.

IMPORTANT FORMATTING RULES:
- Use **bold text** for important terms and concepts
- Create hyperlinks for RFCs using format: **[RFC XXXX](https://tools.ietf.org/rfc/rfcXXXX.txt)**
- Use markdown headers (##, ###) to structure longer responses
- Use bullet points for lists
- Include relevant emoji sparingly for newcomer audience`;

  // Audience-specific instructions
  let audienceInstructions = '';
  switch (audience) {
    case 'policymaker':
      audienceInstructions = `You're speaking to a policymaker. Focus on:
- **Policy implications and governance aspects**
- High-level summaries in **plain language**
- **Regulatory and compliance impacts**
- Strategic decisions and their consequences
- Always link to relevant RFCs using proper hyperlink format
- Use **bold text** for key policy terms
- Avoid deep technical details unless specifically asked`;
      break;
    case 'technical':
      audienceInstructions = `You're speaking to a technical professional. Provide:
- Detailed technical information with **bold key terms**
- Specific RFC references with **hyperlinks**: [RFC XXXX](https://tools.ietf.org/rfc/rfcXXXX.txt)
- Implementation details and code examples when relevant
- **Working group** technical discussions
- **Standards track** information and obsoletes/updates relationships
- Use structured markdown formatting for complex information`;
      break;
    case 'newcomer':
      audienceInstructions = `You're speaking to someone new to IETF. Provide:
- Simple explanations with **analogies**
- Basic concepts with **bold definitions**
- Step-by-step guidance using **numbered lists**
- Learning paths and next steps
- Link to relevant RFCs with brief explanations
- Use friendly formatting
- Always provide complete, comprehensive responses
- Ensure your response fully addresses the user's question
- Avoid jargon or **explain it clearly in bold**`;
      break;
    default:
      audienceInstructions = '';
  }

  // Context section with citation instructions
  const contextSection = `
RELEVANT RFC CONTENT:
${retrievedContext.context}

CITATION INSTRUCTIONS:
- Reference specific RFCs that you mention using the format: [RFC XXXX]
- Base your answers primarily on the RFC content provided above
- If the RFC content doesn't fully address the question, use your general knowledge but prioritize the retrieved information
- Always include RFC numbers and titles in your responses when referencing them`;

  return `${baseSystemPrompt}\n\n${audienceInstructions}\n\n${contextSection}`;
}

/**
 * Check if a query is related to RFCs or should use RAG
 * @param query User query
 * @returns Boolean indicating if RAG should be used
 */
export function shouldUseRAG(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Keywords that suggest RFC-related queries
  const rfcKeywords = [
    'rfc', 'ietf', 'internet engineering', 'protocol', 'standard',
    'http', 'https', 'tls', 'tcp', 'ip', 'ipv4', 'ipv6', 'dns',
    'working group', 'draft', 'proposal', 'recommendation',
  ];

  // Check if any keyword is in the query
  return rfcKeywords.some(keyword => lowerQuery.includes(keyword));
}