export type NemoMood = 'neutral' | 'happy' | 'curious' | 'thinking' | 'sleepy' | 'surprised' | 'bored' | 'excited'
export type NemoState = 'IDLE' | 'CURIOUS' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'HAPPY' | 'SLEEPY' | 'SURPRISED' | 'BORED' | 'EXCITED' | 'ERROR'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type Mood = {
  happiness: number
  energy: number
  curiosity: number
  friendliness: number
  sleepiness: number
  boredom: number
}

export type ChatResponse = {
  reply: string
  emotion: NemoMood
  animation?: string
  shouldSpeak?: boolean
}
