import fs from 'fs';
import { Document } from 'langchain/document';
import path from 'path';
import { processRFC } from './rfc-ingestion';
import { addDocumentsToVectorStore } from './vector-store';

// Comprehensive list of important RFCs to include in our knowledge base
// This list covers all major areas of internet protocols and IETF standards
const IMPORTANT_RFCS = [
  // ====== FOUNDATIONAL & PROCESS RFCs ======
  2026,        // The Internet Standards Process - Revision 3
  2418,        // IETF Working Group Guidelines and Procedures
  3552,        // Guidelines for Writing RFC Text on Security Considerations
  5378,        // Rights Contributors Provide to the IETF Trust
  7322,        // RFC Style Guide
  8126,        // Guidelines for Writing an IANA Considerations Section in RFCs
  8729,        // The RFC Series and RFC Editor
  
  // ====== CORE INTERNET PROTOCOLS ======
  // IP Protocol Suite
  760,         // DoD Internet Protocol (historical)
  791,         // Internet Protocol - DARPA Internet Program Protocol Specification
  792,         // Internet Control Message Protocol
  793,         // Transmission Control Protocol - DARPA Internet Program Protocol Specification
  768,         // User Datagram Protocol
  1122,        // Requirements for Internet Hosts - Communication Layers
  1123,        // Requirements for Internet Hosts - Application and Support
  
  // IPv6
  8200,        // Internet Protocol, Version 6 (IPv6) Specification
  4291,        // IP Version 6 Addressing Architecture
  4861,        // Neighbor Discovery for IP version 6 (IPv6)
  4862,        // IPv6 Stateless Address Autoconfiguration
  3484,        // Default Address Selection for Internet Protocol version 6 (IPv6)
  4443,        // Internet Control Message Protocol (ICMPv6) for IPv6
  5095,        // Deprecation of Type 0 Routing Headers in IPv6
  6724,        // Default Address Selection for Internet Protocol Version 6 (IPv6)
  
  // ====== DNS AND NAMING ======
  1034,        // Domain Names - Concepts and Facilities
  1035,        // Domain Names - Implementation and Specification
  1996,        // A Mechanism for Prompt Notification of Zone Changes (DNS NOTIFY)
  2181,        // Clarifications to the DNS Specification
  2136,        // Dynamic Updates in the Domain Name System (DNS UPDATE)
  2308,        // Negative Caching of DNS Queries (DNS NCACHE)
  2845,        // Secret Key Transaction Authentication for DNS (TSIG)
  3596,        // DNS Extensions to Support IP Version 6
  4033,        // DNS Security Introduction and Requirements
  4034,        // Resource Records for the DNS Security Extensions
  4035,        // Protocol Modifications for the DNS Security Extensions
  5155,        // DNS Security (DNSSEC) Hashed Authenticated Denial of Existence
  6891,        // Extension Mechanisms for DNS (EDNS(0))
  7766,        // DNS Reverse IP and Forwarder (DNS-RIF)
  8484,        // DNS Queries over HTTPS (DoH)
  7858,        // Specification for DNS over Transport Layer Security (TLS)
  
  // ====== HTTP AND WEB PROTOCOLS ======
  // HTTP/1.1 Foundation
  2616,        // Hypertext Transfer Protocol -- HTTP/1.1 (original)
  7230,        // Hypertext Transfer Protocol (HTTP/1.1): Message Syntax and Routing
  7231,        // Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content
  7232,        // Hypertext Transfer Protocol (HTTP/1.1): Conditional Requests
  7233,        // Hypertext Transfer Protocol (HTTP/1.1): Range Requests
  7234,        // Hypertext Transfer Protocol (HTTP/1.1): Caching
  7235,        // Hypertext Transfer Protocol (HTTP/1.1): Authentication
  
  // HTTP/2 and HTTP/3
  7540,        // Hypertext Transfer Protocol Version 2 (HTTP/2)
  7541,        // HTTP/2 Connection Preface
  9113,        // HTTP/2
  9114,        // HTTP/3
  
  // HTTP Semantics (Latest)
  9110,        // HTTP Semantics
  9111,        // HTTP Caching
  9112,        // HTTP/1.1
  
  // Web Security
  6265,        // HTTP State Management Mechanism (Cookies)
  6797,        // HTTP Strict Transport Security (HSTS)
  7469,        // Public Key Pinning Extension for HTTP
  8470,        // Using Early Data in HTTP
  
  // URI and URL
  3986,        // Uniform Resource Identifier (URI): Generic Syntax
  1738,        // Uniform Resource Locators (URL)
  6454,        // The "about" URI Scheme
  
  // ====== SECURITY PROTOCOLS ======
  // TLS/SSL
  8446,        // The Transport Layer Security (TLS) Protocol Version 1.3
  5246,        // The Transport Layer Security (TLS) Protocol Version 1.2
  4346,        // The Transport Layer Security (TLS) Protocol Version 1.1
  2246,        // The TLS Protocol Version 1.0
  8449,        // Record Size Limit Extension for TLS
  8448,        // Semi-Static Diffie-Hellman Key Agreement for TLS 1.3
  
  // Cryptography
  2104,        // HMAC: Keyed-Hashing for Message Authentication
  3174,        // US Secure Hash Algorithm 1 (SHA1)
  6234,        // US Secure Hash Algorithms (SHA and SHA-based HMAC and HKDF)
  8017,        // PKCS #1: RSA Cryptography Specifications Version 2.2
  5652,        // Elliptic Curve Cryptography (ECC) in OpenPGP
  
  // IPSec
  4301,        // Security Architecture for the Internet Protocol
  4302,        // IP Authentication Header
  4303,        // IP Encapsulating Security Payload (ESP)
  
  // ====== EMAIL PROTOCOLS ======
  5321,        // Simple Mail Transfer Protocol
  5322,        // Internet Message Format
  3501,        // Internet Message Access Protocol - Version 4rev1
  1939,        // Post Office Protocol - Version 3
  2045,        // Multipurpose Internet Mail Extensions (MIME) Part One
  2046,        // MIME Part Two: Media Types
  2047,        // MIME Part Three: Message Header Extensions
  2048,        // MIME Part Four: Registration Procedures
  2049,        // MIME Part Five: Conformance Criteria
  6376,        // DomainKeys Identified Mail (DKIM) Signatures
  7208,        // Sender Policy Framework (SPF)
  7489,        // Domain-based Message Authentication, Reporting, and Conformance (DMARC)
  
  // ====== ROUTING PROTOCOLS ======
  4271,        // A Border Gateway Protocol 4 (BGP-4)
  4760,        // Multiprotocol Extensions for BGP-4
  2328,        // OSPF Version 2
  5340,        // OSPF for IPv6
  2453,        // RIP Version 2
  2080,        // RIPng for IPv6
  3031,        // Multiprotocol Label Switching Architecture
  
  // ====== NETWORK SERVICES ======
  // DHCP
  2131,        // Dynamic Host Configuration Protocol
  3315,        // Dynamic Host Configuration Protocol for IPv6 (DHCPv6)
  4361,        // Node-specific Client Identifiers for DHCPv6
  
  // SNMP
  3411,        // An Architecture for Describing Simple Network Management Protocol (SNMP) Management Frameworks
  3412,        // Message Processing and Dispatching for SNMP
  3413,        // Simple Network Management Protocol (SNMP) Applications
  3414,        // User-based Security Model (USM) for version 3 of SNMP
  3415,        // View-based Access Control Model (VACM) for SNMP
  
  // Network Time Protocol
  5905,        // Network Time Protocol Version 4: Protocol and Algorithms Specification
  
  // ====== MODERN PROTOCOLS ======
  // QUIC
  9000,        // QUIC: A UDP-Based Multiplexed and Secure Transport
  9001,        // Using TLS to Secure QUIC
  9002,        // QUIC Loss Detection and Congestion Control
  9114,        // HTTP/3 (uses QUIC)
  
  // WebRTC
  5245,        // Interactive Connectivity Establishment (ICE)
  5389,        // Session Traversal Utilities for NAT (STUN)
  5766,        // Traversal Using Relays around NAT (TURN)
  8825,        // Overview: Real-Time Protocols for Browser-Based Applications (WebRTC)
  
  // ====== TELEPHONY & MULTIMEDIA ======
  3261,        // SIP: Session Initiation Protocol
  3550,        // RTP: A Transport Protocol for Real-Time Applications
  3551,        // RTP Profile for Audio and Video Conferences
  5506,        // Support for Reduced-Size Real-Time Transport Control Protocol (RTCP)
  
  // ====== NETWORK MANAGEMENT ======
  // Syslog
  3164,        // The BSD Syslog Protocol
  5424,        // The Syslog Protocol
  
  // NETCONF
  6241,        // Network Configuration Protocol (NETCONF)
  8040,        // RESTCONF Protocol
  
  // ====== QUALITY OF SERVICE ======
  2474,        // Definition of the Differentiated Services Field (DS Field)
  2597,        // Assured Forwarding PHB Group
  3246,        // An Expedited Forwarding PHB (Per-Hop Behavior)
  
  // ====== ACCESSIBILITY & INTERNATIONALIZATION ======
  5890,        // Internationalized Domain Names for Applications (IDNA)
  5891,        // Internationalized Domain Names in Applications (IDNA): Protocol
  5892,        // The Unicode Code Points and IDNA
  5893,        // Right-to-Left Scripts for IDNA
  5894,        // Internationalized Domain Names for Applications (IDNA): Background, Explanation, and Rationale
  
  // ====== OPERATIONAL GUIDELINES ======
  1918,        // Address Allocation for Private Internets
  3927,        // Common Name Resolution Protocol (CNRP)
  6598,        // IANA-Reserved IPv4 Prefix for Shared Address Space
  7526,        // Deprecating the Anycast Prefix for 6to4 Relay Routers
  
  // ====== SPECIAL USE & EXPERIMENTAL ======
  6761,        // Special-Use Top Level Domains
  6762,        // Multicast DNS
  6763,        // DNS-Based Service Discovery
  8499,        // DNS Terminology
  8624,        // Algorithm Implementation Requirements and Usage Guidance for DNSSEC
];

/**
 * Initialize the RFC database by downloading, processing and storing important RFCs
 * Includes comprehensive error handling, progress tracking, and recovery mechanisms
 * @param priorityLevel 'critical' | 'important' | 'all' - which RFCs to process
 */
async function initializeRFCDatabase(priorityLevel: 'critical' | 'important' | 'all' = 'all') {
  const priorities = getRFCsByPriority();
  
  let rfcsToProcess: number[];
  switch (priorityLevel) {
    case 'critical':
      rfcsToProcess = priorities.critical;
      break;
    case 'important':
      rfcsToProcess = [...priorities.critical, ...priorities.important];
      break;
    case 'all':
    default:
      rfcsToProcess = IMPORTANT_RFCS;
      break;
  }
  
  console.log(`Starting RFC database initialization (${priorityLevel} level)`);
  console.log(`Processing ${rfcsToProcess.length} RFCs out of ${IMPORTANT_RFCS.length} total`);
  console.log(`   Estimated time: ${Math.ceil(rfcsToProcess.length * 0.5)} minutes\n`);
  
  if (priorityLevel === 'critical') {
    console.log('CRITICAL MODE: Processing only essential internet protocols');
  } else if (priorityLevel === 'important') {
    console.log('IMPORTANT MODE: Processing critical + important protocols');
  } else {
    console.log('COMPLETE MODE: Processing all available RFCs');
  }
  console.log('');
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`📁 Created data directory: ${dataDir}`);
  }
  
  // Check for existing backup and ask if we should continue
  const backupPath = path.join(dataDir, 'rfc-documents-backup.json');
  if (fs.existsSync(backupPath)) {
    console.log(`Found existing backup at ${backupPath}`);
    const stats = fs.statSync(backupPath);
    console.log(`   Created: ${stats.mtime.toISOString()}`);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    try {
      const existingData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      console.log(`   Contains: ${existingData.length} document chunks`);
    } catch (error) {
      console.warn(`   WARNING: Could not read existing backup: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.log('');
  }
  
  const successfulRFCs: number[] = [];
  const failedRFCs: { rfc: number; error: string }[] = [];
  let totalDocuments: Document[] = [];
  
  // Create progress tracking
  let processed = 0;
  const startTime = Date.now();
  
  console.log('📖 Starting RFC processing...\n');
  
  // Process RFCs in batches to avoid overwhelming the server
  const batchSize = 5;
  const batches = [];
  for (let i = 0; i < rfcsToProcess.length; i += batchSize) {
    batches.push(rfcsToProcess.slice(i, i + batchSize));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`Processing batch ${batchIndex + 1}/${batches.length} (RFCs: ${batch.join(', ')})`);
    
    // Process batch concurrently with individual error handling
    const batchPromises = batch.map(async (rfcNumber) => {
      try {
        const documents = await processRFCWithRetry(rfcNumber, 2);
        processed++;
        
        const progress = ((processed / rfcsToProcess.length) * 100).toFixed(1);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const eta = processed > 0 ? Math.floor(((elapsed / processed) * (rfcsToProcess.length - processed))) : 0;
        
        console.log(`   SUCCESS RFC ${rfcNumber}: ${documents.length} chunks (${progress}% - ETA: ${eta}s)`);
        
        successfulRFCs.push(rfcNumber);
        return documents;
      } catch (error) {
        processed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`   FAILED RFC ${rfcNumber}: Failed - ${errorMessage}`);
        
        failedRFCs.push({ rfc: rfcNumber, error: errorMessage });
        return [];
      }
    });
    
    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Flatten and add to total documents
    const batchDocuments = batchResults.flat();
    totalDocuments = [...totalDocuments, ...batchDocuments];
    
    // Add delay between batches to be respectful to the server
    if (batchIndex < batches.length - 1) {
      console.log('   Waiting 2 seconds before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('');
    }
  }
  
  // Processing complete - show summary
  const totalTime = Math.floor((Date.now() - startTime) / 1000);
  console.log('Processing Summary:');
  console.log(`   Successful: ${successfulRFCs.length}/${rfcsToProcess.length} RFCs`);
  console.log(`   Failed: ${failedRFCs.length}/${rfcsToProcess.length} RFCs`);
  console.log(`   Total chunks: ${totalDocuments.length}`);
  console.log(`   Total time: ${totalTime}s\n`);
  
  if (failedRFCs.length > 0) {
    console.log('Failed RFCs:');
    failedRFCs.forEach(({ rfc, error }) => {
      console.log(`   RFC ${rfc}: ${error}`);
    });
    console.log('');
  }
  
  if (totalDocuments.length === 0) {
    console.error('💥 No documents were successfully processed. Aborting initialization.');
    return;
  }
  
  try {
    // Save backup with metadata
    console.log('Saving backup file...');
    const backupData = {
      metadata: {
        created: new Date().toISOString(),
        priorityLevel,
        totalRfcs: rfcsToProcess.length,
        successfulRfcs: successfulRFCs.length,
        failedRfcs: failedRFCs.length,
        totalChunks: totalDocuments.length,
        processingTimeSeconds: totalTime,
        successfulRfcList: successfulRFCs.sort((a, b) => a - b),
        failedRfcList: failedRFCs
      },
      documents: totalDocuments
    };
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`Saved ${totalDocuments.length} document chunks to ${backupPath}`);
    
    const backupSize = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2);
    console.log(`   File size: ${backupSize} MB`);
    
    // Also save a simple documents-only backup for compatibility
    const simpleBackupPath = path.join(dataDir, 'rfc-documents-backup.json');
    fs.writeFileSync(simpleBackupPath, JSON.stringify(totalDocuments, null, 2));
    
  } catch (error) {
    console.error('Error saving backup:', error instanceof Error ? error.message : String(error));
    return;
  }
  
  try {
    // Add to vector database
    console.log('🔮 Adding documents to vector store...');
    await addDocumentsToVectorStore(totalDocuments);
    console.log('Successfully added documents to vector store');
    
  } catch (error) {
    console.error('Error adding to vector store:', error instanceof Error ? error.message : String(error));
    console.log('NOTE: Documents are saved in backup file and can be loaded later');
  }
  
  console.log('\nRFC database initialization complete!');
  console.log(`Success rate: ${((successfulRFCs.length / rfcsToProcess.length) * 100).toFixed(1)}%`);
  
  if (successfulRFCs.length >= rfcsToProcess.length * 0.8) {
    console.log('Initialization was highly successful!');
  } else if (successfulRFCs.length >= rfcsToProcess.length * 0.6) {
    console.log('Warning: Initialization was partially successful. Consider retrying failed RFCs.');
  } else {
    console.log('❌ Many RFCs failed to process. Check network connection and try again.');
  }
  
  console.log('\nTips:');
  console.log('   - Run "pnpm test-rag" to verify the system is working');
  console.log('   - Backup files are saved for quick loading on restart');
  console.log('   - Failed RFCs can be retried individually if needed');
  
  if (priorityLevel !== 'all') {
    console.log(`   - To process all RFCs, run with priorityLevel: 'all'`);
  }
}

/**
 * Process a single RFC with retry logic
 * @param rfcNumber RFC number to process
 * @param maxRetries Maximum number of retry attempts
 * @returns Array of Document objects ready for embedding
 */
async function processRFCWithRetry(rfcNumber: number, maxRetries: number = 2): Promise<Document[]> {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await processRFC(rfcNumber);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (attempt <= maxRetries) {
        console.log(`   ⏳ RFC ${rfcNumber}: Attempt ${attempt} failed, retrying... (${errorMessage})`);
        // Wait before retry, with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        throw new Error(`Failed after ${maxRetries + 1} attempts: ${errorMessage}`);
      }
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected error in processRFCWithRetry');
}

/**
 * Get list of RFCs organized by priority for processing
 */
function getRFCsByPriority(): { critical: number[], important: number[], supplementary: number[] } {
  const critical = [
    // Core internet protocols - absolute essentials
    791, 793, 768,    // IP, TCP, UDP
    1034, 1035,       // DNS foundation
    2616, 9110,       // HTTP foundation and latest
    8446,             // TLS 1.3
    2026, 2418,       // IETF process
  ];
  
  const important = [
    // Important but not critical protocols
    8200, 4291,       // IPv6 basics
    5321, 5322,       // Email
    4271,             // BGP
    2131,             // DHCP
    9000, 9001, 9002, // QUIC
    7230, 7231, 7232, 7233, 7234, 7235, // HTTP/1.1 updates
  ];
  
  // All others are supplementary
  const criticalAndImportant = new Set([...critical, ...important]);
  const supplementary = IMPORTANT_RFCS.filter(rfc => !criticalAndImportant.has(rfc));
  
  return { critical, important, supplementary };
}

// Run if this file is executed directly
if (require.main === module) {
  initializeRFCDatabase().catch(error => {
    console.error('❌ Fatal error during initialization:', error);
    process.exit(1);
  });
}

export { getRFCsByPriority, IMPORTANT_RFCS, initializeRFCDatabase, processRFCWithRetry };

