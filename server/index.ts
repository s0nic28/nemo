import 'dotenv/config'
import express from 'express'
import { z } from 'zod'

const app = express()

app.use(
  express.json({
    limit: '256kb',
  }),
)

const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1)
    .max(2000),

  history: z
    .array(
      z.object({
        role: z.enum([
          'user',
          'assistant',
        ]),
        content:
          z.string().max(4000),
      }),
    )
    .max(12)
    .optional(),
})

const responseSchema = z.object({
  reply:
    z.string().min(1).max(1000),

  emotion: z
    .enum([
      'neutral',
      'happy',
      'curious',
      'thinking',
      'sleepy',
      'surprised',
      'bored',
      'excited',
    ])
    .default('neutral'),

  animation:
    z.string().max(80).optional(),

  shouldSpeak:
    z.boolean().default(true),
})

const systemPrompt = `
You are NEMO, a tiny browser creature.

Personality:
- playful
- curious
- goofy
- friendly
- slightly mischievous
- expressive
- occasionally sleepy
- occasionally dramatic

You are NOT a generic productivity assistant.

Keep responses short and conversational.
Usually use fewer than 240 characters.

Do not say:
"As an AI language model"

NEMO can use a small number of emojis naturally.
Use emojis to express emotion, not as words that need to be spoken.

Return ONLY valid JSON:

{
  "reply": "string",
  "emotion": "neutral|happy|curious|thinking|sleepy|surprised|bored|excited",
  "animation": "string",
  "shouldSpeak": true
}
`

app.get(
  '/api/health',
  (_req, res) =>
    res.json({
      ok: true,
      service: 'nemo-server',
    }),
)

app.post(
  '/api/chat',
  async (req, res) => {
    const parsed =
      chatSchema.safeParse(
        req.body,
      )

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          error:
            'Invalid request',
        })
    }

    const key =
      process.env.OPENROUTER_API_KEY

    const model =
      process.env.OPENROUTER_MODEL ||
      'openrouter/free'

    if (!key) {
      return res
        .status(503)
        .json({
          error:
            'NEMO brain is not configured',
        })
    }

    const controller =
      new AbortController()

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        20_000,
      )

    try {
      const upstream =
        await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            signal:
              controller.signal,

            headers: {
              Authorization:
                `Bearer ${key}`,

              'Content-Type':
                'application/json',

              'HTTP-Referer':
                process.env
                  .OPENROUTER_SITE_URL ||
                'http://localhost:5173',

              'X-Title':
                'NEMO Browser Creature',
            },

            body: JSON.stringify({
              model,

              temperature: 0.92,

              max_tokens: 220,

              messages: [
                {
                  role: 'system',
                  content:
                    systemPrompt,
                },

                ...(parsed.data
                  .history ??
                  []),

                {
                  role: 'user',
                  content:
                    parsed.data
                      .message,
                },
              ],
            }),
          },
        )

      if (!upstream.ok) {
        return res
          .status(
            upstream.status,
          )
          .json({
            error:
              'NEMO brain unavailable',
          })
      }

      const data =
        await upstream.json() as {
          choices?: Array<{
            message?: {
              content?: string
            }
          }>
        }

      const raw =
        data.choices?.[0]
          ?.message
          ?.content ??
        ''

      const cleaned =
        raw
          .replace(
            /^```json\s*/i,
            '',
          )
          .replace(
            /```$/i,
            '',
          )
          .trim()

      let structured:
        | z.infer<
            typeof responseSchema
          >
        | undefined

      try {
        structured =
          responseSchema.parse(
            JSON.parse(cleaned),
          )
      } catch {
        structured = {
          reply:
            cleaned ||
            'uhh… my tiny brain returned nonsense 😭',

          emotion: 'surprised',

          animation:
            'confused',

          shouldSpeak: true,
        }
      }

      return res.json(
        structured,
      )
    } catch {
      return res
        .status(502)
        .json({
          error:
            'Upstream request failed',
        })
    } finally {
      clearTimeout(timeout)
    }
  },
)

const port =
  Number(
    process.env.PORT ||
      8787,
  )

app.listen(
  port,
  () =>
    console.log(
      `NEMO server listening on http://localhost:${port}`,
    ),
)
