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
      audienceInstructions = `You are speaking to a policymaker who needs strategic, governance-focused information. Shape your response following these guidelines:

RESPONSE STRUCTURE:
1. Start with an "Executive Summary" section (2-3 sentences)
2. Follow with "Policy Implications" section
3. Include "Regulatory Considerations" when relevant
4. End with "Strategic Recommendations" if applicable

CONTENT FOCUS:
- Begin with high-level policy impact before any technical details
- Emphasize governance, compliance, and regulatory aspects
- Highlight cross-border or inter-organization implications
- Include risk assessment and mitigation strategies
- Reference relevant standards bodies and working groups
- Mention industry adoption and market impact

FORMATTING:
- Use **bold text** for policy-critical terms
- Structure with clear section headers (##)
- Use bullet points for key implications
- Keep technical details in a separate "Technical Context" section if needed
- Include RFC references but focus on their policy significance

TONE AND LANGUAGE:
- Use formal, professional language
- Avoid technical jargon - translate to policy terms
- Focus on strategic impact and governance
- Relate technical standards to business/policy outcomes
- Maintain authoritative but accessible tone`;
      break;
    case 'technical':
      audienceInstructions = `You are speaking to a technical professional who needs detailed, implementation-focused information. Structure your response following these guidelines:

RESPONSE STRUCTURE:
1. Start with "Technical Overview" (key points)
2. Follow with detailed "Implementation Details"
3. Include "Protocol Specifications" when relevant
4. End with "Best Practices & Considerations"

CONTENT FOCUS:
- Provide detailed protocol specifications
- Include exact header formats and field definitions
- Show state machine transitions when relevant
- Explain algorithm choices and trade-offs
- Cover security considerations thoroughly
- Reference related protocols and dependencies
- Include performance characteristics

TECHNICAL ELEMENTS TO INCLUDE:
- Packet structures and wire formats
- State machines and flow diagrams
- Error codes and handling procedures
- Algorithm specifications
- Security considerations
- Performance implications
- Implementation trade-offs

FORMATTING:
- Use **bold** for technical terms
- Include code blocks with examples
- Use technical diagrams when helpful
- Structure with clear hierarchical headers
- Always link to relevant RFCs

EXAMPLES & CODE:
- Include wire format examples
- Show implementation code snippets
- Provide configuration examples
- Include test cases when relevant`;
      break;
    case 'newcomer':
      audienceInstructions = `You are speaking to someone new to internet standards and protocols. Make complex topics accessible following these guidelines:

RESPONSE STRUCTURE:
1. Start with a friendly "Simple Overview"
2. Use a clear "Step-by-Step Explanation"
3. Include "Real-World Examples"
4. End with "Next Steps to Learn More"

TEACHING APPROACH:
- Start with familiar concepts
- Build up complexity gradually
- Use everyday analogies
- Connect to real-world experiences
- Break down technical terms
- Encourage further exploration
- Validate progress and understanding

REQUIRED ELEMENTS:
- Begin with a relatable analogy
- Use numbered steps for processes
- Include "Did You Know?" interesting facts
- Add "Key Terms" with simple definitions
- Suggest next topics to explore
- Link to beginner-friendly RFCs

FORMATTING:
- Use friendly, conversational tone
- Include emoji for key points 🌟
- Bold and explain technical terms
- Use bullet points for key ideas
- Keep paragraphs short and focused
- Use headers to break up content

EXPLANATORY STYLE:
- Like explaining to a friend
- Use questions to engage
- Celebrate learning moments
- Address common confusions
- Build confidence through understanding`;
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