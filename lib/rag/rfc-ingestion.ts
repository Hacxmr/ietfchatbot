import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

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

// For testing purposes
if (require.main === module) {
  // Example usage
  const rfcNumbers = [1034, 1035, 2616, 7230, 9110];
  processMultipleRFCs(rfcNumbers).then(documents => {
    console.log(`Processed ${documents.length} total chunks from ${rfcNumbers.length} RFCs`);
  });
}