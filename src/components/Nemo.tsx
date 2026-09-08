import { motion } from 'framer-motion'
import type { NemoMood, NemoState } from '../types'

type Props = {
  state: NemoState
  mood: NemoMood
  gazeX: number
  gazeY: number
  onClick: () => void
}

const eyeVariants = {
  neutral: { scaleY: 1, scaleX: 1 },
  happy: { scaleY: 0.56, scaleX: 1.08 },
  curious: { scaleY: 1.1, scaleX: 1.08 },
  thinking: { scaleY: 0.75, scaleX: 1.03 },
  sleepy: { scaleY: 0.23, scaleX: 1.02 },
  surprised: { scaleY: 1.3, scaleX: 1.18 },
  bored: { scaleY: 0.44, scaleX: 0.98 },
  excited: { scaleY: 1.18, scaleX: 1.12 },
}

export default function Nemo({ state, mood, gazeX, gazeY, onClick }: Props) {
  const variant = eyeVariants[mood]
  const moving = ['CURIOUS', 'EXCITED', 'HAPPY', 'SURPRISED', 'SPEAKING'].includes(state)

  return (
    <motion.button
      className={`nemo ${state.toLowerCase()}`}
      onClick={onClick}
      aria-label="Interact with NEMO"
      animate={{ y: moving ? [0, -5, 0] : [0, -2, 0], rotate: state === 'CURIOUS' ? [-2, 2, -1, 0] : 0 }}
      transition={{ duration: moving ? 1.05 : 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="nemo-halo" />
      <div className="nemo-body">
        <div className="nemo-antenna"><span /></div>
        <div className="nemo-face">
          <div className="eye" style={{ '--gx': `${gazeX}px`, '--gy': `${gazeY}px` } as React.CSSProperties}>
            <motion.div animate={variant} transition={{ duration: 0.16 }} className="eye-panel">
              <div className="eye-glow" />
            </motion.div>
          </div>
          <div className="eye" style={{ '--gx': `${gazeX}px`, '--gy': `${gazeY}px` } as React.CSSProperties}>
            <motion.div animate={variant} transition={{ duration: 0.16 }} className="eye-panel">
              <div className="eye-glow" />
            </motion.div>
          </div>
        </div>
        <div className="nemo-neck" />
        <div className="nemo-base">
          <span />
          <span />
          <span />
        </div>
      </div>
    </motion.button>
  )
}
