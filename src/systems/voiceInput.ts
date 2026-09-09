export type NemoSpeechRecognitionEvent = {
  results: SpeechRecognitionResultList
}

export type NemoSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number

  start: () => void
  stop: () => void
  abort: () => void

  onstart: (() => void) | null
  onend: (() => void) | null
  onerror:
    ((event: SpeechRecognitionErrorEvent) => void) | null
  onresult:
    ((event: NemoSpeechRecognitionEvent) => void) | null
}

type RecognitionConstructor =
  new () => NemoSpeechRecognition

type SpeechWindow = Window & {
  SpeechRecognition?:
    RecognitionConstructor

  webkitSpeechRecognition?:
    RecognitionConstructor
}

export function getSpeechRecognitionConstructor() {
  const browserWindow =
    window as SpeechWindow

  return (
    browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null
  )
}

export function speechRecognitionSupported() {
  return (
    getSpeechRecognitionConstructor() !== null
  )
}

export function createSpeechRecognition() {
  const Constructor =
    getSpeechRecognitionConstructor()

  return Constructor
    ? new Constructor()
    : null
}
