import type { Mood, NemoMood, NemoState } from '../types'

export const initialMood: Mood = {
  happiness: 72,
  energy: 82,
  curiosity: 70,
  friendliness: 84,
  sleepiness: 14,
  boredom: 10,
}

export function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function moodAfterInteraction(mood: Mood): Mood {
  return {
    ...mood,
    happiness: clamp(mood.happiness + 4),
    energy: clamp(mood.energy + 1),
    curiosity: clamp(mood.curiosity + 2),
    boredom: clamp(mood.boredom - 5),
  }
}

export function moodAfterIdle(mood: Mood): Mood {
  return {
    ...mood,
    energy: clamp(mood.energy - 1),
    boredom: clamp(mood.boredom + 2),
    sleepiness: clamp(mood.sleepiness + 1),
  }
}

export function chooseIdleState(mood: Mood): { state: NemoState; emotion: NemoMood } {
  if (mood.sleepiness > 76) return { state: 'SLEEPY', emotion: 'sleepy' }
  if (mood.boredom > 72) return { state: 'BORED', emotion: 'bored' }
  if (mood.curiosity > 78) return { state: 'CURIOUS', emotion: 'curious' }
  if (mood.happiness > 86) return { state: 'HAPPY', emotion: 'happy' }
  return { state: 'IDLE', emotion: 'neutral' }
}
