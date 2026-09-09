import { KokoroTTS } from "kokoro-js"

let ttsPromise: Promise<KokoroTTS> | null = null
let currentAudio: HTMLAudioElement | null = null

async function getTTS() {
  if (!ttsPromise) {
    console.log("🐾 NEMO: downloading voice model...")

    ttsPromise = KokoroTTS.from_pretrained(
      "onnx-community/Kokoro-82M-ONNX",
      {
        dtype: "q8",
      },
    )

    ttsPromise.then(() => {
      console.log("🐾 NEMO: voice model READY")
    }).catch((error) => {
      console.error("🐾 NEMO: voice model FAILED", error)
      ttsPromise = null
    })
  }

  return ttsPromise
}

export async function preloadVoice() {
  try {
    await getTTS()
  } catch {
    // Voice loading must never break NEMO.
  }
}

export async function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
) {
  if (!text.trim()) {
    onEnd?.()
    return false
  }

  cancelSpeech()

  try {
    const tts = await getTTS()

    console.log("🐾 NEMO: generating speech:", text)

    const audio = await tts.generate(text, {
      voice: "af_sky",
    })

    const blob = audio.toBlob()
    const url = URL.createObjectURL(blob)

    const player = new Audio(url)

    currentAudio = player

    // Goofy NEMO treatment.
    player.playbackRate = 1.12

    player.onplay = () => {
      console.log("🔊 NEMO: SPEAKING")
      onStart?.()
    }

    player.onended = () => {
      console.log("🔊 NEMO: speech finished")

      URL.revokeObjectURL(url)

      if (currentAudio === player) {
        currentAudio = null
      }

      onEnd?.()
    }

    player.onerror = (event) => {
      console.error("🔊 NEMO: audio playback failed", event)

      URL.revokeObjectURL(url)

      if (currentAudio === player) {
        currentAudio = null
      }

      onEnd?.()
    }

    await player.play()

    return true
  } catch (error) {
    console.error("🐾 NEMO TTS ERROR:", error)

    onEnd?.()

    return false
  }
}

export function cancelSpeech() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio.src = ""
    currentAudio = null
  }
}
