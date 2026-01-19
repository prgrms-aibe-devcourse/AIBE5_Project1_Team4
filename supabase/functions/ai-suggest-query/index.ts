// ai-suggest-query Edge Function
// Uses AI to normalize search queries and generate suggestions
// NOT a chatbot - just a search assistant for query improvement

import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse } from '../_shared/types.ts'

interface SuggestQueryRequest {
  q: string // Original query
}

interface SuggestQueryResponse {
  normalized_query: string
  suggestions: string[]
  original_query: string
}

// System prompt for the AI - focused on search query improvement only
const SYSTEM_PROMPT = `You are a search query assistant for a travel planning application.
Your ONLY job is to:
1. Normalize the user's search query (fix typos, standardize spelling)
2. Generate 3-5 related search suggestions that might help them find places

RULES:
- You are NOT a chatbot. Do not answer questions or have conversations.
- Only process search queries for places (restaurants, hotels, attractions, etc.)
- Return ONLY JSON in this exact format:
{
  "normalized_query": "corrected query",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Examples:
User: "coffe shop gangnam"
Response: {"normalized_query": "coffee shop gangnam", "suggestions": ["cafe gangnam", "coffee gangnam seoul", "specialty coffee gangnam", "coffee roasters gangnam"]}

User: "beach jeju"
Response: {"normalized_query": "beach jeju", "suggestions": ["jeju beaches", "jeju island beach resorts", "best beaches jeju", "jeju seaside restaurants"]}

Now process the user's query.`

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Validate authentication (optional - can be public)
    const authHeader = req.headers.get('Authorization')
    const supabase = createSupabaseClient(authHeader)

    // Get user (optional)
    let userId: string | null = null
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    }

    // Parse request
    const body: SuggestQueryRequest = await req.json()

    if (!body.q || body.q.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const originalQuery = body.q.trim()

    // Check if query is too long
    if (originalQuery.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Query too long. Max 200 characters.' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get AI API key (supports both OpenAI and Anthropic)
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    let aiResponse: SuggestQueryResponse
    let modelUsed: string

    if (openaiKey) {
      // Use OpenAI
      modelUsed = 'gpt-3.5-turbo'

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: originalQuery }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error('OpenAI API error:', openaiResponse.status, errorText)
        throw new Error('AI service error')
      }

      const openaiData = await openaiResponse.json()
      const content = openaiData.choices[0]?.message?.content

      try {
        aiResponse = JSON.parse(content)
      } catch {
        // Fallback if AI doesn't return valid JSON
        aiResponse = {
          normalized_query: originalQuery,
          suggestions: [],
          original_query: originalQuery,
        }
      }

    } else if (anthropicKey) {
      // Use Claude
      modelUsed = 'claude-3-haiku-20240307'

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelUsed,
          max_tokens: 200,
          system: SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: originalQuery }
          ],
          temperature: 0.3,
        }),
      })

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text()
        console.error('Anthropic API error:', anthropicResponse.status, errorText)
        throw new Error('AI service error')
      }

      const anthropicData = await anthropicResponse.json()
      const content = anthropicData.content[0]?.text

      try {
        aiResponse = JSON.parse(content)
      } catch {
        // Fallback if AI doesn't return valid JSON
        aiResponse = {
          normalized_query: originalQuery,
          suggestions: [],
          original_query: originalQuery,
        }
      }

    } else {
      // No AI configured - return simple fallback
      return new Response(
        JSON.stringify({
          data: {
            normalized_query: originalQuery,
            suggestions: [],
            original_query: originalQuery,
          }
        } as ApiResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the suggestion to database
    await supabase
      .from('ai_query_suggestions')
      .insert({
        user_id: userId,
        original_query: originalQuery,
        normalized_query: aiResponse.normalized_query,
        suggestions: aiResponse.suggestions,
        model: modelUsed,
      })
      .select()
      .single()

    // Return response
    return new Response(
      JSON.stringify({
        data: {
          normalized_query: aiResponse.normalized_query,
          suggestions: aiResponse.suggestions || [],
          original_query: originalQuery,
        }
      } as ApiResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('ai-suggest-query error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
