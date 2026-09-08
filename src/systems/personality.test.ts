import { describe, expect, it } from 'vitest'
import { chooseIdleState, initialMood, moodAfterIdle, moodAfterInteraction } from './personality'

describe('NEMO personality', () => {
  it('raises happiness after interaction', () => {
    const next = moodAfterInteraction(initialMood)
    expect(next.happiness).toBeGreaterThan(initialMood.happiness)
    expect(next.boredom).toBeLessThan(initialMood.boredom)
  })

  it('gets sleepier and more bored while idle', () => {
    const next = moodAfterIdle(initialMood)
    expect(next.sleepiness).toBeGreaterThan(initialMood.sleepiness)
    expect(next.boredom).toBeGreaterThan(initialMood.boredom)
  })

  it('chooses sleepy state when sleepiness is high', () => {
    const next = chooseIdleState({ ...initialMood, sleepiness: 90 })
    expect(next.state).toBe('SLEEPY')
    expect(next.emotion).toBe('sleepy')
  })
})
