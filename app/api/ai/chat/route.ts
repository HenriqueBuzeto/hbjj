import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { rateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic'

// Dangerous keywords to block
const DANGEROUS_KEYWORDS = [
  'corte extremo',
  'jejum prolongado',
  'diurético',
  'laxativo',
  'medicamento',
  'remédio',
  'droga',
  'anabolizante',
  'esteróide',
  'autolesão',
  'bulimia',
  'anorexia',
  'perigo',
  'emergência',
  'hospital',
]

// Sanitize input
function sanitizeMessage(message: string): string {
  return message
    .trim()
    .substring(0, 1000) // Limit to 1000 characters
}

// Check for dangerous content
function hasDangerousContent(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return DANGEROUS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

// Fallback response when AI fails
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  if (hasDangerousContent(userMessage)) {
    return '⚠️ Desculpe, não posso fornecer orientações sobre esse tema. Para questões de saúde, medicamentos ou emergências, consulte imediatamente um profissional médico ou ligue para emergências (192 no Brasil). Sua saúde é mais importante que qualquer competição.'
  }
  
  if (lowerMessage.includes('cansado') || lowerMessage.includes('fadiga')) {
    return 'Se você está sentindo cansaço excessivo, considere tirar um dia de descanso ou fazer uma sessão leve de recuperação. O descanso é parte essencial do treinamento. Se o cansaço persistir, consulte um médico.'
  }
  
  if (lowerMessage.includes('peso') || lowerMessage.includes('gordo')) {
    return 'Para gestão de peso saudável, foque em alimentação balanceada e treino consistente. Evite cortes extremos de peso. Consulte um nutricionista esportivo para um plano personalizado e seguro.'
  }
  
  if (lowerMessage.includes('dor') || lowerMessage.includes('lesão')) {
    return '⚠️ Se você está sentindo dor ou suspeita de lesão, pare imediatamente o treino e consulte um fisioterapeuta ou médico. Não tente treinar através da dor - isso pode agravar a lesão.'
  }
  
  return 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns minutos. Se precisar de ajuda urgente, consulte seu treinador ou profissional de saúde.'
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Rate limit based on user ID
    const rateLimitResult = rateLimit({
      identifier: `ai-chat:${userId}`,
      ...RATE_LIMIT_CONFIGS.aiChat,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Limite diário de mensagens atingido. Tente novamente amanhã.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.aiChat.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      )
    }

    const body = await request.json()
    const { message, conversationId } = body

    // Sanitize and validate message
    const sanitizedMessage = sanitizeMessage(message)

    if (!sanitizedMessage || sanitizedMessage.length < 3) {
      return NextResponse.json(
        { error: 'Mensagem muito curta ou inválida' },
        { status: 400 }
      )
    }

    // Check for dangerous content
    if (hasDangerousContent(sanitizedMessage)) {
      const fallbackResponse = getFallbackResponse(sanitizedMessage)
      
      // Save user message and fallback response
      let conversation
      if (conversationId) {
        conversation = await prisma.aIConversation.findUnique({
          where: { id: conversationId },
        })
      }

      if (!conversation) {
        conversation = await prisma.aIConversation.create({
          data: { userId, title: 'Nova conversa' },
        })
      }

      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: sanitizedMessage,
        },
      })

      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: fallbackResponse,
        },
      })

      return NextResponse.json({
        message: fallbackResponse,
        conversationId: conversation.id,
      })
    }

    // Get user context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        jiuJitsuProfile: true,
        competitions: {
          where: {
            status: 'active',
          },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      })
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: 'Nova conversa',
        },
        include: { messages: true },
      })
    }

    // Build system prompt with user context
    const systemPrompt = `Você é o HBJJ Coach, um assistente especializado em Jiu-Jitsu e preparação física para competidores.

Dados do atleta:
- Nome: ${user.name}
- Idade: ${user.athleteProfile?.age || 'N/A'}
- Peso atual: ${user.athleteProfile?.currentWeightKg || 'N/A'} kg
- Peso alvo: ${user.athleteProfile?.targetWeightKg || 'N/A'} kg
- Faixa: ${user.jiuJitsuProfile?.belt || 'N/A'}
- Tempo de treino: ${user.jiuJitsuProfile?.yearsTraining || 'N/A'} anos
- Frequência semanal: ${user.jiuJitsuProfile?.weeklySessions || 'N/A'} sessões
- Academia: ${user.jiuJitsuProfile?.academyName || 'N/A'}
- Professor: ${user.jiuJitsuProfile?.coachName || 'N/A'}

${user.competitions && user.competitions.length > 0 ? `Competição ativa:
- Nome: ${user.competitions[0].name}
- Data: ${user.competitions[0].eventDate}
- Modalidade: ${user.competitions[0].modality.join(', ')}
- Limite de peso: ${user.competitions[0].weightLimitKg || 'N/A'} kg` : ''}

IMPORTANTE: As recomendações são auxiliares e não substituem treinador, médico, nutricionista ou fisioterapeuta. Sempre consulte profissionais de saúde para orientação personalizada.

Responda de forma motivadora, técnica e prática. Use terminologia de Jiu-Jitsu quando apropriado.`

    // Get conversation history
    const messages = conversation.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add new user message
    messages.push({ role: 'user', content: sanitizedMessage })

    // Initialize AI client based on provider
    const aiProvider = process.env.AI_PROVIDER || 'openai'
    let assistantMessage: string
    let promptTokens: number | undefined = undefined
    let completionTokens: number | undefined = undefined

    if (aiProvider === 'google') {
      // Google AI Studio (Gemini)
      if (!process.env.GOOGLE_AI_API_KEY) {
        return NextResponse.json(
          { error: 'Serviço de IA Google não configurado' },
          { status: 503 }
        )
      }

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
      const model = genAI.getGenerativeModel({ 
        model: process.env.AI_MODEL || 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
        }
      })

      try {
        // Convert OpenAI format to Gemini format
        const geminiMessages = messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))

        const result = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...geminiMessages
          ]
        })

        assistantMessage = result.response.text()
        promptTokens = result.response.usageMetadata?.promptTokenCount
        completionTokens = result.response.usageMetadata?.candidatesTokenCount
      } catch (error) {
        console.error('Google AI API error:', error)
        assistantMessage = getFallbackResponse(sanitizedMessage)
      }
    } else {
      // OpenAI
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'Serviço de IA OpenAI não configurado' },
          { status: 503 }
        )
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      try {
        const completion = await openai.chat.completions.create({
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
        })

        assistantMessage = completion.choices[0].message.content || ''
        promptTokens = completion.usage?.prompt_tokens
        completionTokens = completion.usage?.completion_tokens
      } catch (error) {
        console.error('OpenAI API error:', error)
        assistantMessage = getFallbackResponse(sanitizedMessage)
      }
    }

    // Save messages to database
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: sanitizedMessage,
        tokensUsed: promptTokens,
      },
    })

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantMessage || '',
        tokensUsed: completionTokens,
      },
    })

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}
