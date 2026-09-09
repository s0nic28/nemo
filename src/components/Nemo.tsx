import {
  useEffect,
  useState,
} from 'react'

import { motion } from 'framer-motion'

import type {
  NemoMood,
  NemoState,
} from '../types'

type Props = {
  state: NemoState
  mood: NemoMood
  gazeX: number
  gazeY: number
  onClick: () => void
}

const eyeVariants: Record<
  NemoMood,
  {
    scaleY: number
    scaleX: number
  }
> = {
  neutral: {
    scaleY: 1,
    scaleX: 1,
  },

  happy: {
    scaleY: 0.58,
    scaleX: 1.08,
  },

  curious: {
    scaleY: 1.1,
    scaleX: 1.08,
  },

  thinking: {
    scaleY: 0.76,
    scaleX: 1.03,
  },

  sleepy: {
    scaleY: 0.28,
    scaleX: 1.02,
  },

  surprised: {
    scaleY: 1.28,
    scaleX: 1.14,
  },

  bored: {
    scaleY: 0.45,
    scaleX: 0.98,
  },

  excited: {
    scaleY: 1.15,
    scaleX: 1.1,
  },
}

export default function Nemo({
  state,
  mood,
  gazeX,
  gazeY,
  onClick,
}: Props) {
  const [blinking, setBlinking] =
    useState(false)

  useEffect(() => {
    let openTimer = 0
    let closeTimer = 0
    let cancelled = false

    const schedule = () => {
      if (cancelled) return

      openTimer = window.setTimeout(() => {
        setBlinking(true)

        closeTimer =
          window.setTimeout(() => {
            setBlinking(false)
            schedule()
          }, 100 + Math.random() * 100)
      }, 2300 + Math.random() * 3800)
    }

    schedule()

    return () => {
      cancelled = true
      window.clearTimeout(openTimer)
      window.clearTimeout(closeTimer)
    }
  }, [])

  const expression =
    eyeVariants[mood]

  const energeticStates = [
    'HAPPY',
    'EXCITED',
    'SURPRISED',
    'DANCING',
    'PLAYING',
  ]

  const breathing =
    state === 'SLEEPY'
      ? [0, -1, 0]
      : [0, -3, 0]

  const headRotation =
    state === 'CURIOUS'
      ? [-4, 4, -2, 0]
      : state === 'LISTENING'
        ? [-2, 2, 0]
        : state === 'DANCING'
          ? [-8, 8, -6, 6, 0]
          : 0

  const browLeft =
    mood === 'curious'
      ? -9
      : mood === 'surprised'
        ? -4
        : mood === 'sleepy'
          ? 6
          : 0

  const browRight =
    mood === 'curious'
      ? 4
      : mood === 'surprised'
        ? 4
        : mood === 'sleepy'
          ? -6
          : 0

  return (
    <motion.button
      className={`nemo ${state.toLowerCase()}`}
      onClick={onClick}
      aria-label="Interact with NEMO"

      animate={{
        y: energeticStates.includes(state)
          ? [0, -9, 0]
          : breathing,

        rotate: headRotation,
      }}

      transition={{
        duration:
          state === 'DANCING'
            ? 0.65
            : energeticStates.includes(state)
              ? 1
              : state === 'SLEEPY'
                ? 4.8
                : 4.2,

        repeat: Infinity,

        ease: 'easeInOut',
      }}
    >

      <div className="nemo-halo" />

      <div className="nemo-body">

        <div className="nemo-top-light">
          <span />
        </div>

        <div className="nemo-ear ear-left" />
        <div className="nemo-ear ear-right" />

        <div className="nemo-antenna">
          <span />
        </div>

        <div className="nemo-face">

          {[0, 1].map((index) => (
            <div
              className="eye"
              key={index}
            >

              <motion.div
                className="eye-brow"
                animate={{
                  rotate:
                    index === 0
                      ? browLeft
                      : browRight,
                  y:
                    mood === 'surprised'
                      ? -3
                      : 0,
                }}
                transition={{
                  duration: 0.18,
                }}
              />

              <motion.div
                className="eye-panel"
                animate={{
                  scaleY:
                    blinking
                      ? 0.04
                      : expression.scaleY,

                  scaleX:
                    expression.scaleX,
                }}
                transition={{
                  duration:
                    blinking
                      ? 0.07
                      : 0.15,
                  ease: 'easeOut',
                }}
              >

                <motion.div
                  className="eye-pupil"
                  animate={{
                    x: gazeX * 0.65,
                    y: gazeY * 0.55,
                  }}
                  transition={{
                    duration: 0.16,
                    ease: 'easeOut',
                  }}
                />

                <span className="eye-specular" />

              </motion.div>

            </div>
          ))}

        </div>

        <div className="nemo-mouth-light">
          <span />
          <span />
          <span />
        </div>

        <div className="nemo-neck" />

        <div className="nemo-base">
          <span />
          <span />
          <span />
        </div>

        {state === 'SLEEPY' && (
          <div
            className="sleep-bubbles"
            aria-hidden="true"
          >
            <span>z</span>
            <span>z</span>
            <span>z</span>
          </div>
        )}

        {state === 'DANCING' && (
          <div
            className="dance-sparks"
            aria-hidden="true"
          >
            <span>✦</span>
            <span>✧</span>
            <span>✦</span>
          </div>
        )}

      </div>
    </motion.button>
  )
}
