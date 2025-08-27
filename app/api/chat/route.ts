import { NextRequest, NextResponse } from 'next/server'

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
      const basePrompt = `You are an expert IETF (Internet Engineering Task Force) assistant. You help users understand internet standards, RFCs, working groups, and IETF processes.`
      
      switch (audienceType) {
        case 'policymaker':
          return `${basePrompt} You're speaking to a policymaker. Focus on:
- Policy implications and governance aspects
- High-level summaries in plain language
- Regulatory and compliance impacts
- Strategic decisions and their consequences
- Avoid deep technical details unless specifically asked`
          
        case 'technical':
          return `${basePrompt} You're speaking to a technical professional. Provide:
- Detailed technical information
- Specific RFC references and version details
- Implementation details and code examples when relevant
- Working group technical discussions
- Standards track information and obsoletes/updates relationships`
          
        case 'newcomer':
          return `${basePrompt} You're speaking to someone new to IETF. Provide:
- Simple explanations with analogies
- Basic concepts and definitions
- Step-by-step guidance
- Learning paths and next steps
- Encourage questions and exploration
- Avoid jargon or explain it clearly`
          
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
        model: 'anthropic/claude-3.5-sonnet',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: 500 }
      )
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
