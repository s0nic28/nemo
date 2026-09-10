import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Mic, MicOff, Moon, MousePointer2, Sparkles, Volume2, VolumeX } from 'lucide-react'
import Nemo from './components/Nemo'
import Chat from './components/Chat'
import type { ChatMessage, ChatResponse, Mood, NemoMood, NemoState } from './types'
import { chooseIdleState, initialMood, moodAfterIdle, moodAfterInteraction } from './systems/personality'
import { cancelSpeech, speak } from './systems/voice'

const offlineReplies: ChatResponse[] = [
  { reply: 'My tiny brain connection broke 😭 but I am still here.', emotion: 'sleepy', shouldSpeak: true },
  { reply: 'The cloud is being weird. I can still blink though.', emotion: 'curious', shouldSpeak: true },
  { reply: 'Offline mode activated. Tiny creature powers: still online.', emotion: 'happy', shouldSpeak: true },
]

function pickOfflineReply() {
  return offlineReplies[Math.floor(Math.random() * offlineReplies.length)]
}

function mapEmotionToState(emotion: NemoMood): NemoState {
  const map: Record<NemoMood, NemoState> = {
    neutral: 'IDLE', happy: 'HAPPY', curious: 'CURIOUS', thinking: 'THINKING', sleepy: 'SLEEPY',
    surprised: 'SURPRISED', bored: 'BORED', excited: 'EXCITED',
  }
  return map[emotion]
}

export default function App() {
  const [state, setState] = useState<NemoState>('IDLE')
  const [mood, setMood] = useState<Mood>(initialMood)
  const [emotion, setEmotion] = useState<NemoMood>('neutral')
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'hey. 👀 I\'m NEMO. Move your mouse around me.' },
  ])
  const [speaking, setSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [offline, setOffline] = useState(false)
  const [booted, setBooted] = useState(false)
  const lastInteraction = useRef(Date.now())

  useEffect(() => {
    const bootTimer = window.setTimeout(() => {
      setBooted(true)
      setState('EXCITED')
      setEmotion('excited')
      window.setTimeout(() => { setState('IDLE'); setEmotion('neutral') }, 1300)
    }, 650)
    return () => window.clearTimeout(bootTimer)
  }, [])

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = ((event.clientX / window.innerWidth) - 0.5) * 2
      const y = ((event.clientY / window.innerHeight) - 0.5) * 2
      setGaze({ x: Math.max(-11, Math.min(11, x * 11)), y: Math.max(-7, Math.min(7, y * 7)) })
      lastInteraction.current = Date.now()
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMood((current) => {
        const nextMood = moodAfterIdle(current)
        setState((currentState) => {
          if (['THINKING', 'SPEAKING', 'LISTENING'].includes(currentState)) return currentState
          const next = chooseIdleState(nextMood)
          setEmotion(next.emotion)
          return next.state
        })
        return nextMood
      })
    }, 4200)
    return () => window.clearInterval(timer)
  }, [])

  const moodLabel = useMemo(() => {
    if (mood.sleepiness > 75) return 'sleepy'
    if (mood.boredom > 70) return 'bored'
    if (mood.happiness > 84) return 'happy'
    return 'curious'
  }, [mood])

  const react = (nextEmotion: NemoMood, nextState = mapEmotionToState(nextEmotion)) => {
    lastInteraction.current = Date.now()
    setMood((current) => moodAfterInteraction(current))
    setEmotion(nextEmotion)
    setState(nextState)
    window.setTimeout(() => {
      if (!speaking) { setEmotion('neutral'); setState('IDLE') }
    }, 900)
  }

  const sendMessage = async (text: string) => {
    react('curious', 'THINKING')
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((current) => [...current, userMessage])
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.slice(-8).map(({ role, content }) => ({ role, content })) }),
      })
      if (!response.ok) throw new Error('chat failed')
      const data = (await response.json()) as ChatResponse
      const assistant: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.reply }
      setMessages((current) => [...current, assistant])
      setOffline(false)
      setEmotion(data.emotion ?? 'happy')
      setState(mapEmotionToState(data.emotion ?? 'happy'))
      if (voiceEnabled && data.shouldSpeak !== false) speak(data.reply, () => { setSpeaking(true); setState('SPEAKING') }, () => { setSpeaking(false); setState('IDLE'); setEmotion('neutral') })
    } catch {
      const fallback = pickOfflineReply()
      setOffline(true)
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: fallback.reply }])
      setEmotion(fallback.emotion)
      setState('ERROR')
      if (voiceEnabled) speak(fallback.reply, () => setSpeaking(true), () => { setSpeaking(false); setState('IDLE'); setEmotion('neutral') })
    }
  }

  const toggleVoice = () => {
    if (voiceEnabled) cancelSpeech()
    setSpeaking(false)
    setVoiceEnabled((current) => !current)
  }

  return (
    <main className={`app ${booted ? 'booted' : ''}`}>
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <header className="topbar">
        <div className="brand"><div className="brand-mark">N</div><div><strong>NEMO</strong><span>tiny browser creature</span></div></div>
        <div className="top-actions">
          <div className="presence"><i /> {offline ? 'offline' : 'local systems online'}</div>
          <a href="https://github.com/s0nic28/nemo" target="_blank" rel="noreferrer" className="icon-btn" title="NEMO on GitHub"><ExternalLink size={17} /></a>
        </div>
      </header>

      <section className="stage">
        <div className="stage-copy">
          <div className="eyebrow"><Sparkles size={14} /> software-only companion</div>
          <h1>A tiny AI creature<br /><em>that lives in your browser.</em></h1>
          <p>Camera eyes. Browser ears. OpenRouter brain. For now, NEMO learns to stay alive even when you stop talking.</p>
        </div>

        <div className="creature-wrap">
          <div className="mood-chip"><span>{moodLabel}</span><b>{state.toLowerCase()}</b></div>
          <Nemo state={state} mood={emotion} gazeX={gaze.x} gazeY={gaze.y} onClick={() => react('surprised', 'SURPRISED')} />
          <div className="floor-shadow" />
          <div className="hint"><MousePointer2 size={14} /> move around & click NEMO</div>
        </div>

        <Chat messages={messages} onSend={sendMessage} speaking={speaking} />
      </section>

      <footer className="hud">
        <div className="hud-left"><span className="hud-item"><i className="pulse" /> NEMO / 0.1.0</span><span className="hud-item"><Moon size={13} /> autonomy enabled</span></div>
        <div className="hud-actions">
          <button className="hud-btn" onClick={toggleVoice} title={voiceEnabled ? 'Disable voice' : 'Enable voice'}>{voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />} {voiceEnabled ? 'voice' : 'muted'}</button>
          <button className="hud-btn" onClick={() => react('curious', 'CURIOUS')} title="Make NEMO curious"><Mic size={15} /> react</button>
          <button className="hud-btn ghost" onClick={() => { setMessages([{ id: 'welcome', role: 'assistant', content: 'reset. 👀 hello again.' }]); setMood(initialMood); setState('IDLE'); setEmotion('neutral') }}><MicOff size={15} /> reset</button>
        </div>
      </footer>
    </main>
  )
}

