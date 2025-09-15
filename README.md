# IETF Chatbot - AI-Powered Internet Standards Assistant

An intelligent chatbot designed to help users understand Internet Engineering Task Force (IETF) standards, RFCs (Request for Comments), and internet protocols. Built with Next.js, enhanced with Retrieval-Augmented Generation (RAG) for accurate, authoritative responses.

![IETF Chatbot](https://img.shields.io/badge/IETF-Chatbot-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### **Audience-Specific Responses**
- **Policymakers**: High-level summaries, regulatory implications, governance aspects
- **Technical Professionals**: Detailed specifications, implementation details, working group discussions
- **Newcomers**: Simple explanations, analogies, step-by-step guidance

### **Comprehensive RFC Knowledge Base**
- **~150 RFCs** covering all major internet protocol areas
- **Intelligent Retrieval**: RAG system provides contextually relevant information
- **Source Citations**: Every response includes RFC references with direct links
- **Priority-Based Initialization**: Critical/Important/All modes for flexible setup

### **Modern User Experience**
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Themes**: Automatic theme switching support
- **Real-time Chat**: Instant responses with typing indicators
- **Search & History**: RFC search functionality and chat history
- **Working Group Dashboard**: Track IETF working group activities

### **Advanced AI Integration**
- **RAG Enhancement**: Retrieval-Augmented Generation for accurate responses
- **Multiple Models**: OpenAI and OpenRouter API support
- **Fallback System**: Robust error handling with offline responses
- **Context Awareness**: Maintains conversation context and user preferences

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **OpenAI API Key** or **OpenRouter API Key**
- **Clerk Account** (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hacxmr/ietfchatbot.git
cd ietfchatbot

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Setup

Create `.env.local` with the following variables:

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI APIs (choose one or both)
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Initialize RFC Database

Choose your initialization mode based on needs:

```bash
# Quick start - Critical RFCs only (2-3 minutes)
pnpm init-critical

# Balanced - Important RFCs (5-7 minutes)
pnpm init-important

# Complete - All RFCs (12-15 minutes)
pnpm init-rfc-db

# Development testing
pnpm test-rag
```

### Run the Application

```bash
# Start development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to access the chatbot.

## 🏗️ Architecture

### **Technology Stack**

- **Frontend**: Next.js 15.2.4, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Clerk (OAuth, secure user management)
- **AI/ML**: OpenAI GPT models, LangChain for RAG
- **Vector Storage**: In-memory vector store with backup persistence
- **Deployment**: Vercel-ready, Docker support

### **RAG System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    IETF Chatbot RAG System                     │
├─────────────────────────────────────────────────────────────────┤
│  User Query                                                     │
│      ↓                                                          │
│  Query Analysis (shouldUseRAG)                                  │
│      ↓                                                          │
│  Vector Search (similarity)                                     │
│      ↓                                                          │
│  Context Retrieval (top-k results)                             │
│      ↓                                                          │
│  Prompt Enhancement (audience-specific)                         │
│      ↓                                                          │
│  LLM Generation (with RFC context)                             │
│      ↓                                                          │
│  Response + Source Citations                                    │
└─────────────────────────────────────────────────────────────────┘
```

### **Project Structure**

```
ietfchatbot/
├── app/                          # Next.js app directory
│   ├── api/chat/route.ts        # Main chat API endpoint
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main chat interface
├── components/                   # React components
│   ├── ui/                      # Radix UI components
│   ├── auth-debug-info.tsx      # Authentication debugging
│   ├── notifications-system.tsx # IETF notifications
│   ├── rfc-search.tsx          # RFC search functionality
│   ├── theme-provider.tsx       # Theme management
│   ├── theme-toggle.tsx         # Dark/light mode toggle
│   └── working-group-dashboard.tsx # WG tracking
├── lib/                         # Utilities and core logic
│   ├── rag/                    # RAG system implementation
│   │   ├── init-database.ts    # Database initialization
│   │   ├── retrieval.ts        # Core retrieval logic
│   │   ├── rfc-ingestion.ts    # RFC processing
│   │   └── vector-store.ts     # Vector storage
│   └── utils.ts                # Utility functions
├── scripts/                     # Initialization scripts
│   ├── init-critical.js        # Critical RFCs only
│   ├── init-important.js       # Important RFCs
│   ├── test-rag.js            # Development testing
│   └── debug-rag.js           # System diagnostics
├── .data/                      # Generated data files
│   └── rfc-documents-backup.json # Vector store backup
├── README-RAG.md              # Detailed RAG documentation
└── README.md                  # This file
```

## 📚 RFC Knowledge Base

### **Coverage Areas (150+ RFCs)**

#### **Core Internet Protocols**
- **IPv4/IPv6**: IP specifications, addressing, routing
- **TCP/UDP**: Transport layer protocols
- **ICMP**: Internet Control Message Protocol

#### **DNS and Naming**
- **Core DNS**: RFCs 1034, 1035, 2181
- **Security**: DNSSEC, DNS over HTTPS/TLS
- **Extensions**: EDNS, dynamic updates

#### **HTTP and Web**
- **HTTP/1.1**: Semantics, caching, authentication
- **HTTP/2**: Binary protocol, multiplexing
- **HTTP/3**: QUIC-based protocol
- **Security**: HSTS, cookie management

#### **Security Protocols**
- **TLS**: Latest 1.3 specification, cipher suites
- **Cryptography**: Hash functions, digital signatures
- **IPSec**: Network layer security

#### **Email Protocols**
- **SMTP**: Mail transfer protocol
- **IMAP/POP3**: Mail access protocols
- **Authentication**: SPF, DKIM, DMARC

#### **Routing Protocols**
- **BGP**: Border Gateway Protocol
- **OSPF**: Open Shortest Path First
- **IS-IS**: Intermediate System protocols

#### **Emerging Technologies**
- **QUIC**: Modern transport protocol
- **WebRTC**: Real-time communications
- **IoT**: Internet of Things protocols

### **Priority Classifications**

| Priority | Count | Description | Init Time |
|----------|--------|-------------|-----------|
| **Critical** | 35 RFCs | Essential protocols | 2-3 min |
| **Important** | 100 RFCs | Critical + common standards | 5-7 min |
| **All** | 150 RFCs | Complete knowledge base | 12-15 min |

## 🎯 Usage Examples

### **For Policymakers**

**Query**: "What are the privacy implications of DNS over HTTPS?"

**Response**: High-level explanation of DoH policy impacts, regulatory considerations, and governance challenges with relevant RFC citations.

### **For Technical Professionals**

**Query**: "How does HTTP/3 handle connection migration?"

**Response**: Detailed technical explanation with QUIC specifications, implementation details, and working group discussions.

### **For Newcomers**

**Query**: "What is TCP and why is it important?"

**Response**: Simple explanation with analogies, basic concepts in bold, and step-by-step guidance to understand transport protocols.

## 🛠️ Development

### **Available Scripts**

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run linting

# RAG System
pnpm init-rfc-db           # Initialize complete RFC database
pnpm init-critical         # Initialize critical RFCs only
pnpm init-important        # Initialize important RFCs
pnpm test-rag             # Test RAG functionality
```

### **Testing the System**

```bash
# Test RAG retrieval
pnpm test-rag

# Debug system components
node scripts/debug-rag.js

# Test chat API directly
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me about RFC 1034"}],"audience":"technical"}'
```

### **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes* | OpenAI API key for embeddings and chat |
| `OPENROUTER_API_KEY` | Yes* | Alternative to OpenAI for chat completions |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk authentication public key |
| `CLERK_SECRET_KEY` | Yes | Clerk authentication secret key |

*One of the AI API keys is required

## 🔧 Configuration

### **RAG System Settings**

```typescript
// Embedding configuration
const EMBEDDING_CONFIG = {
  model: "text-embedding-3-small",
  dimensions: 1536,
  maxRetries: 3,
  timeout: 30000
};

// Processing configuration
const PROCESSING_CONFIG = {
  chunkSize: 1000,
  chunkOverlap: 200,
  batchSize: 5,
  requestsPerSecond: 2
};
```

### **API Configuration**

```typescript
// Chat API settings
const CHAT_CONFIG = {
  model: "microsoft/wizardlm-2-8x22b",
  maxTokens: 2000,
  temperature: 0.7,
  timeout: 60000
};
```

## 📈 Performance

### **Initialization Benchmarks**

| Mode | RFCs | Documents | Time | Memory |
|------|------|-----------|------|--------|
| Critical | 35 | ~500 | 2-3 min | ~200MB |
| Important | 100 | ~1500 | 5-7 min | ~500MB |
| All | 150 | ~2500 | 12-15 min | ~800MB |

### **Response Times**

- **With RAG**: 2-5 seconds (including vector search)
- **Without RAG**: 1-3 seconds (direct LLM call)
- **Fallback**: <1 second (cached responses)

### **Optimization Features**

- **Batch Processing**: Multiple RFCs processed simultaneously
- **Progress Tracking**: Real-time initialization progress
- **Error Recovery**: Automatic retry with exponential backoff
- **Memory Management**: Efficient document chunking and storage

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Setup**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test-rag`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Contribution Areas**

- **RFC Coverage**: Add new RFCs to the knowledge base
- **UI/UX**: Improve the chat interface and user experience
- **Performance**: Optimize vector search and response generation
- **Features**: Add new functionality like advanced search or analytics
- **Documentation**: Improve guides and API documentation

### **Code Style**

- Use TypeScript for type safety
- Follow existing code formatting (Prettier/ESLint)
- Add JSDoc comments for new functions
- Write descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IETF Community** for creating and maintaining internet standards
- **LangChain** for RAG implementation framework
- **OpenAI** for embeddings and language model APIs
- **Clerk** for seamless authentication
- **Vercel** for hosting and deployment platform

## 📞 Support

- **Documentation**: See [README-RAG.md](README-RAG.md) for detailed RAG system documentation
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/Hacxmr/ietfchatbot/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/Hacxmr/ietfchatbot/discussions)

## 🎯 Roadmap

### **Current Version (v1.0)**
- ✅ Comprehensive RFC database (150+ RFCs)
- ✅ RAG-enhanced responses
- ✅ Audience-specific prompting
- ✅ Source citation system
- ✅ Authentication and user management

### **Upcoming Features (v1.1)**
- 🔄 Persistent vector database (ChromaDB/Pinecone)
- 🔄 Real-time RFC monitoring and updates
- 🔄 Advanced search and filtering
- 🔄 Usage analytics and metrics
- 🔄 API rate limiting and caching

### **Future Enhancements (v2.0)**
- 🔮 Multi-language support
- 🔮 Voice interface integration
- 🔮 Mobile application
- 🔮 Integration with IETF tools and systems
- 🔮 Collaborative features and team workspaces

---

**Built with ❤️ for the IETF community and internet standards enthusiasts worldwide.**