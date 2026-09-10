import { z } from "zod"

const requestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(12)
    .optional(),
})

const responseSchema = z.object({
  reply: z.string().min(1).max(1000),
  emotion: z
    .enum([
      "neutral",
      "happy",
      "curious",
      "thinking",
      "sleepy",
      "surprised",
      "bored",
      "excited",
    ])
    .default("neutral"),
  animation: z.string().max(80).optional(),
  shouldSpeak: z.boolean().default(true),
})

const systemPrompt = `
You are NEMO, a tiny browser creature.

You are playful, curious, friendly, slightly mischievous,
and concise.

You live inside the user's browser.

Never say "As an AI language model".

Return ONLY valid JSON:

{
  "reply": "string",
  "emotion": "neutral|happy|curious|thinking|sleepy|surprised|bored|excited",
  "animation": "string",
  "shouldSpeak": true
}

Keep normal replies under 240 characters unless the
user asks for more detail.
`

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    })
  }

  const parsed = requestSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
    })
  }

  const key = process.env.OPENROUTER_API_KEY

  if (!key) {
    return res.status(503).json({
      error: "NEMO brain is not configured",
    })
  }

  const model =
    process.env.OPENROUTER_MODEL ||
    "openrouter/free"

  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    20000,
  )

  try {
    const referer =
      process.env.OPENROUTER_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173")

    const upstream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": "NEMO Browser Creature",
        },
        body: JSON.stringify({
          model,
          temperature: 0.9,
          max_tokens: 220,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...(parsed.data.history ?? []),
            {
              role: "user",
              content: parsed.data.message,
            },
          ],
        }),
      },
    )

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "NEMO brain unavailable",
      })
    }

    const data = (await upstream.json()) as {
      choices?: Array<{
        message?: {
          content?: string
        }
      }>
    }

    const raw =
      data.choices?.[0]?.message?.content ?? ""

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim()

    try {
      return res.json(
        responseSchema.parse(
          JSON.parse(cleaned),
        ),
      )
    } catch {
      return res.json({
        reply:
          cleaned ||
          "uhh... my tiny brain returned nonsense 😭",
        emotion: "surprised",
        animation: "error",
        shouldSpeak: true,
      })
    }
  } catch {
    return res.status(502).json({
      error: "Upstream request failed",
    })
  } finally {
    clearTimeout(timeout)
  }
}
