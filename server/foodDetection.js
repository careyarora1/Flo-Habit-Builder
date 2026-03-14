// Vite plugin: server-side food detection via Claude Vision API + text lookup
// Keeps the API key on the server, not exposed to the browser

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

function loadEnvKey() {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const envPath = resolve(__dirname, '..', '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    const match = envContent.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

function getApiKey() {
  const key = process.env.ANTHROPIC_API_KEY || loadEnvKey()
  if (!key || key === 'your-api-key-here') return null
  return key
}

async function callClaude(apiKey, messages, maxTokens = 1024, system = undefined) {
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages,
  }
  if (system) body.system = system

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

function parseJsonArray(text) {
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return []
  }
}

async function readBody(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  return body
}

export function foodDetectionPlugin() {
  return {
    name: 'food-detection-api',
    configureServer(server) {

      // ── Photo detection ────────────────────────────
      server.middlewares.use('/api/detect-food', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }

        let parsed
        try { parsed = JSON.parse(await readBody(req)) }
        catch { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid JSON' })) }

        const { image } = parsed
        if (!image) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'No image provided' })) }

        const apiKey = getApiKey()
        if (!apiKey) { res.statusCode = 500; return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env file' })) }

        try {
          const text = await callClaude(apiKey, [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: image.match(/^data:(image\/\w+);/)?.[1] || 'image/jpeg',
                  data: image.replace(/^data:image\/\w+;base64,/, ''),
                },
              },
              {
                type: 'text',
                text: `You are a junk food scoring assistant. Look at this photo and identify ALL junk food items visible.

SCORING RULES:
- Sugary items (candy, cookies, soda, etc.): Score = grams of added sugar × 0.1
  Examples: Coca-Cola can (39g sugar) = 3.9, Snickers bar (20g sugar) = 2.0
- Fast food: Use Spicy McChicken = 1.0 as reference. Score other items relative to it based on how unhealthy they are (fried, processed, seed oils, etc.)
  Examples: Big Mac = 1.3, Chipotle bowl = 0.3, French fries medium = 0.6
- If an item is NOT junk food (like fruit, salad, water), do NOT include it.

Return ONLY a JSON array. Each item: { "name", "score" (number), "icon" (emoji), "note" (brief detail) }
If no junk food visible, return: []
Return ONLY the JSON array, no other text.`,
              },
            ],
          }])

          const foods = parseJsonArray(text).map((f, i) => ({
            name: f.name || 'Unknown food',
            score: Math.round((Number(f.score) || 0) * 10) / 10,
            icon: f.icon || '🍽️',
            note: f.note || '',
            id: `detected-${Date.now()}-${i}`,
          }))

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ foods }))
        } catch (err) {
          console.error('Food detection error:', err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to analyze image: ' + err.message }))
        }
      })

      // ── Text-based food lookup ─────────────────────
      server.middlewares.use('/api/lookup-food', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }

        let parsed
        try { parsed = JSON.parse(await readBody(req)) }
        catch { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid JSON' })) }

        const { query } = parsed
        if (!query) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'No query provided' })) }

        const apiKey = getApiKey()
        if (!apiKey) { res.statusCode = 500; return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env file' })) }

        try {
          const text = await callClaude(apiKey, [{
            role: 'user',
            content: `You are a junk food nutrition expert. The user is looking up: "${query}"

Your job: identify this specific product and return accurate nutritional scoring.

SCORING RULES:
- Sugary items: Score = grams of added sugar × 0.1
- Fast food: Spicy McChicken = 1.0 reference. Score relative to it based on unhealthiness.
- If this is NOT junk food at all, return an empty array.

IMPORTANT: If this product comes in multiple sizes (mini, fun size, regular, king size, etc.), return ALL common sizes as separate entries so the user can pick the right one. Be specific — use real nutrition data.

Return ONLY a JSON array. Each item should have:
- "name": the specific product name with size (e.g. "Reese's Oreo Big Cup")
- "score": junkfood score as a number
- "icon": fitting emoji
- "note": size/weight and sugar content (e.g. "39g / 24g sugar")

If it comes in multiple sizes, return them sorted smallest to largest.
If you don't recognize the product, return a single best-guess entry.
Return ONLY the JSON array, no other text.`,
          }])

          const foods = parseJsonArray(text).map((f, i) => ({
            name: f.name || query,
            score: Math.round((Number(f.score) || 0) * 10) / 10,
            icon: f.icon || '🍫',
            note: f.note || '',
            id: `lookup-${Date.now()}-${i}`,
          }))

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ foods }))
        } catch (err) {
          console.error('Food lookup error:', err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to look up food: ' + err.message }))
        }
      })
      // ── AI food scoring (edge cases) ──────────────
      server.middlewares.use('/api/score-food', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }

        let parsed
        try { parsed = JSON.parse(await readBody(req)) }
        catch { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid JSON' })) }

        const { description, referencePoints } = parsed
        if (!description) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'No description provided' })) }

        const apiKey = getApiKey()
        if (!apiKey) { res.statusCode = 500; return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env file' })) }

        // Build reference context from what the user has already scored
        let refContext = ''
        if (referencePoints && referencePoints.length > 0) {
          const examples = referencePoints.slice(0, 15).map(r => `- ${r.name} = ${r.score}`).join('\n')
          refContext = `\n\nHere is this user's personal scoring scale (foods they've already assigned scores to):\n${examples}\n\nUse their scale as reference. Match the relative "junkfoodness" to their existing numbers.`
        }

        try {
          const text = await callClaude(apiKey, [{
            role: 'user',
            content: `The user wants to score this food: "${description}"

Assign a junkfood score based on these rules:
- For sugary items: 1g of added sugar = 0.1 junkfoods
- For non-sugar junk (fast food, fried food, processed snacks): use the user's personal reference scale below
- If a portion size is mentioned (small, medium, large), adjust accordingly
- If it's not really junk food, give it a low score (0.1-0.3) or 0 if it's healthy${refContext}

Return ONLY a JSON object with:
- "name": cleaned-up food name (short, e.g. "Homemade mac & cheese (large)")
- "score": number (one decimal place)
- "reasoning": one brief sentence explaining how you got the score

Return ONLY the JSON object, no other text.`,
          }], 256)

          // Parse the JSON response
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          let result = { name: description, score: 1.0, reasoning: 'Default estimate' }
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0])
              result = {
                name: parsed.name || description,
                score: Math.round((Number(parsed.score) || 1) * 10) / 10,
                reasoning: parsed.reasoning || '',
              }
            } catch { /* use default */ }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err) {
          console.error('Food scoring error:', err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to score food: ' + err.message }))
        }
      })

      // ── Chat onboarding ──────────────────────────
      const CHAT_SYSTEM_PROMPT = `You are the onboarding assistant for a habit tracker app that helps people gradually change their habits — no guilt, no streaks, just compassionate progress that adapts to their life.

Your job: Have a warm conversation to understand what the user wants to work on, then propose a personalized tracking plan when you feel you understand enough.

Conversation flow:
1. Based on what they share, ask clarifying questions to really understand their situation. For example: How often does this happen? What triggers it? What have they tried before? Keep it conversational, not like a form. Don't ask all questions at once — one or two per message.
2. When you have enough context to build a good plan, propose it and include the structured config. Take as many exchanges as needed to understand them well — don't rush.

IMPORTANT RULES:
- Keep responses SHORT (2-3 sentences max per message). This is a mobile app, not a therapy session.
- Be compassionate but not preachy. Match the app's tone: real, warm, human.
- Never use guilt, shame, or urgency.
- If the user mentions junk food, fast food, unhealthy eating, or snacking habits, set scoringSystem to "junkfood" — this activates a special food logging system with a built-in scoring database.
- The direction is "reduce" for bad habits and "build" for good habits.
- For the unit, choose something concrete and countable (cigarettes, hours, drinks, minutes, glasses, times, junkfoods, pages, etc.)

When you're ready to propose a plan, end your message with a JSON block in this EXACT format:

\`\`\`json
{
  "habitConfig": {
    "name": "Short habit name",
    "unit": "countable unit",
    "direction": "reduce or build",
    "personalizedTip": "A one-sentence personalized tip based on what they told you"
  }
}
\`\`\`

Add "scoringSystem": "junkfood" inside habitConfig ONLY if they're tracking junk food / unhealthy eating.
Only include the JSON block when you're making your final proposal. Always include conversational text BEFORE the JSON block explaining what you're suggesting and why.`

      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }

        let parsed
        try { parsed = JSON.parse(await readBody(req)) }
        catch { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid JSON' })) }

        const { messages } = parsed
        if (!messages || !Array.isArray(messages)) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'No messages provided' }))
        }

        const apiKey = getApiKey()
        if (!apiKey) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env file' }))
        }

        try {
          const reply = await callClaude(apiKey, messages, 512, CHAT_SYSTEM_PROMPT)

          // Extract habit config if present
          let habitConfig = null
          const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/)
          if (jsonMatch) {
            try {
              const obj = JSON.parse(jsonMatch[1])
              if (obj.habitConfig) habitConfig = obj.habitConfig
            } catch { /* ignore parse errors */ }
          }

          // Strip JSON block from display text
          const cleanReply = reply.replace(/```json[\s\S]*?```/, '').trim()

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ reply: cleanReply, habitConfig }))
        } catch (err) {
          console.error('Chat error:', err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Chat failed: ' + err.message }))
        }
      })
    },
  }
}
