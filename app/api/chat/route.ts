import { NextRequest, NextResponse } from 'next/server'

// Fallback responses for when API is unavailable
function getFallbackResponse(audience: string, userMessage: string): string {
  const lowerMessage = userMessage?.toLowerCase() || ''
  
  if (audience === 'policymaker') {
    if (lowerMessage.includes('dns') || lowerMessage.includes('domain name')) {
      return `# DNS RFCs: Policy and Governance Overview

Request for Comments (RFCs) are the official publications of the Internet Engineering Task Force (IETF). Here are key DNS-related RFCs with policy implications:

## Core DNS Standards

### **[RFC 1034](https://tools.ietf.org/rfc/rfc1034.txt) - Domain Names - Concepts and Facilities**
This foundational RFC introduced the DNS design and concepts. For policymakers, it outlines the **distributed nature of DNS**, which has significant implications for governance and jurisdiction.

### **[RFC 1035](https://tools.ietf.org/rfc/rfc1035.txt) - Domain Names - Implementation and Specification**
Provides detailed DNS protocol specifications. Important for understanding how policies around **internet access and content regulation** can be implemented.

### **[RFC 2181](https://tools.ietf.org/rfc/rfc2181.txt) - Clarifications to the DNS Specification**
Clears up ambiguities in DNS specifications. Relevant for policymakers as it underscores the importance of **precision in standards** for consistent implementation across jurisdictions.

## Policy Implications
- **Governance**: Distributed DNS requires coordination across multiple jurisdictions
- **Security**: Authentication mechanisms prevent DNS spoofing
- **Interoperability**: Precise standards ensure consistent global implementation`
    }
    if (lowerMessage.includes('rfc')) {
      return "**RFCs (Request for Comments)** are the official documents that define internet standards and protocols. They guide how different systems communicate across the internet, ensuring global interoperability. For policymakers, RFCs represent **consensus-driven technical standards** that impact digital governance and internet policy worldwide."
    }
    return "As a policymaker, you're interested in how **IETF standards impact digital governance**. The IETF creates the fundamental protocols that enable global internet connectivity, affecting areas like **cybersecurity, data privacy, and digital sovereignty**. These standards influence regulatory frameworks and international cooperation in cyberspace."
  }
  
  if (audience === 'technical') {
    if (lowerMessage.includes('dns') || lowerMessage.includes('domain name')) {
      return `# DNS Technical Implementation

## Core DNS RFCs

### **[RFC 1034](https://tools.ietf.org/rfc/rfc1034.txt) & [RFC 1035](https://tools.ietf.org/rfc/rfc1035.txt)** - DNS Foundation
- **Status**: Internet Standard (STD 13)
- **Implementation**: Base DNS protocol specifications
- **Key Features**: Hierarchical namespace, recursive/iterative queries

### **[RFC 1996](https://tools.ietf.org/rfc/rfc1996.txt) - DNS NOTIFY**
- **Purpose**: Zone change notification mechanism
- **Implementation**: Secondary servers receive prompt updates
- **Status**: Proposed Standard

### **[RFC 2845](https://tools.ietf.org/rfc/rfc2845.txt) - TSIG**
- **Security**: Transaction signatures for DNS
- **Cryptography**: HMAC-based authentication
- **Use Case**: Secure zone transfers and dynamic updates

## Standards Track Information
- **Obsoletes/Updates**: Check individual RFCs for relationships
- **Working Group**: DNS Extensions (DNSEXT) - now concluded
- **Current Focus**: DNS Operations (DNSOP) working group`
    }
    if (lowerMessage.includes('rfc')) {
      return "**RFCs** are maintained through a rigorous standards process. Each RFC has a specific **status** (Proposed Standard, Draft Standard, Internet Standard) and may **obsolete or update** previous RFCs. Key technical details include protocol specifications, security considerations, IANA considerations, and implementation requirements. Working Groups develop these through **consensus and peer review**."
    }
    return "The **IETF operates through Working Groups** organized into Areas (Applications, Internet, Operations, Routing, Security, Transport). Each WG focuses on specific protocols or problems. The **standards track** involves Internet-Drafts, Working Group Last Call, IESG review, and RFC publication. **Implementation experience** drives the standardization process."
  }
  
  // newcomer
  if (lowerMessage.includes('dns') || lowerMessage.includes('domain name')) {
    return `# DNS for Beginners 🌐

## What is DNS?
Think of **DNS (Domain Name System)** as the internet's phone book! When you type **www.google.com**, DNS translates that friendly name into a computer address (like 172.217.164.110) that computers can understand.

## Important DNS Documents (RFCs)

### **[RFC 1034](https://tools.ietf.org/rfc/rfc1034.txt) - How DNS Works**
This is like the **instruction manual** that explains how the internet's address system works. It's the foundation that makes sure when you type a website name, you get to the right place!

### **[RFC 1035](https://tools.ietf.org/rfc/rfc1035.txt) - DNS Technical Details**
This document has all the **technical specifications** - think of it as the detailed blueprint that engineers use to build DNS systems.

## Why Should You Care? 🤔
- **Every website visit** uses DNS
- **Email delivery** depends on DNS
- **Security features** protect against fake websites
- **Global coordination** makes the internet work everywhere

DNS is what makes the internet user-friendly - without it, you'd have to remember number addresses for every website!`
  }
  if (lowerMessage.includes('rfc')) {
    return "Think of **RFCs (Request for Comments)** as instruction manuals for the internet! They're documents that explain how different parts of the internet should work together. Just like how you need **rules for a game** so everyone can play fairly, RFCs are the rules that make sure computers around the world can talk to each other properly. They cover everything from **sending emails to browsing websites**!"
  }
  
  return "Welcome to the **IETF world**! The Internet Engineering Task Force is like a global community of volunteers who work together to keep the internet running smoothly. They create the **'rules' (called standards)** that help computers communicate with each other. It's all done through **open collaboration** - anyone can participate and contribute ideas!"
}

export async function POST(request: NextRequest) {
  try {
    const { messages, audience } = await request.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Create a system prompt based on the audience type
    const getSystemPrompt = (audienceType: string) => {
      const basePrompt = `You are an expert IETF (Internet Engineering Task Force) assistant. You help users understand internet standards, RFCs, working groups, and IETF processes.

IMPORTANT FORMATTING RULES:
- Use **bold text** for important terms and concepts
- Create hyperlinks for RFCs using format: **[RFC XXXX](https://tools.ietf.org/rfc/rfcXXXX.txt)**
- Use markdown headers (##, ###) to structure longer responses
- Use bullet points for lists
- Include relevant emoji sparingly for newcomer audience`
      
      switch (audienceType) {
        case 'policymaker':
          return `${basePrompt} You're speaking to a policymaker. Focus on:
- **Policy implications and governance aspects**
- High-level summaries in **plain language**
- **Regulatory and compliance impacts**
- Strategic decisions and their consequences
- Always link to relevant RFCs using proper hyperlink format
- Use **bold text** for key policy terms
- Avoid deep technical details unless specifically asked`
          
        case 'technical':
          return `${basePrompt} You're speaking to a technical professional. Provide:
- Detailed technical information with **bold key terms**
- Specific RFC references with **hyperlinks**: [RFC XXXX](https://tools.ietf.org/rfc/rfcXXXX.txt)
- Implementation details and code examples when relevant
- **Working group** technical discussions
- **Standards track** information and obsoletes/updates relationships
- Use structured markdown formatting for complex information`
          
        case 'newcomer':
          return `${basePrompt} You're speaking to someone new to IETF. Provide:
- Simple explanations with **analogies**
- Basic concepts with **bold definitions**
- Step-by-step guidance using **numbered lists**
- Learning paths and next steps
- Link to relevant RFCs with brief explanations
- Use friendly formatting with occasional emoji 🌐 📚
- Avoid jargon or **explain it clearly in bold**`
          
        default:
          return basePrompt
      }
    }

    const systemMessage = {
      role: 'system',
      content: getSystemPrompt(audience)
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'IETF Chatbot',
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      
      // Fallback response for development/demo purposes
      const fallbackResponse = getFallbackResponse(audience, messages[messages.length - 1]?.content)
      return NextResponse.json({
        content: fallbackResponse,
        usage: { total_tokens: 0 },
        fallback: true
      })
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: data.usage
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
