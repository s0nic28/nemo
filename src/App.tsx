import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  Gamepad2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'

import Nemo from './components/Nemo'
import Chat from './components/Chat'
import Games from './components/Games'

import type {
  ChatMessage,
  ChatResponse,
  Mood,
  NemoMood,
  NemoState,
} from './types'

import {
  chooseIdleState,
  initialMood,
  moodAfterIdle,
  moodAfterInteraction,
} from './systems/personality'

import {
  cancelSpeech,
  preloadVoice,
  speak,
} from './systems/voice'

import {
  createSpeechRecognition,
  speechRecognitionSupported,
  type NemoSpeechRecognition,
} from './systems/voiceInput'

const offlineReplies: ChatResponse[] = [
  {
    reply:
      'My tiny brain connection broke 😭 but I am still here.',
    emotion: 'sleepy',
    shouldSpeak: true,
  },
  {
    reply:
      'The cloud is being weird. I can still blink though 👀',
    emotion: 'curious',
    shouldSpeak: true,
  },
  {
    reply:
      'Offline mode activated. Tiny creature powers: still online ✨',
    emotion: 'happy',
    shouldSpeak: true,
  },
]

const emojiRules: Array<{
  pattern: RegExp
  emotion: NemoMood
  state: NemoState
}> = [
  {
    pattern: /[😂🤣😆😄😁]/u,
    emotion: 'excited',
    state: 'EXCITED',
  },
  {
    pattern: /[🎉🎊🥳🔥✨]/u,
    emotion: 'excited',
    state: 'EXCITED',
  },
  {
    pattern: /[❤️🩷🧡💛💚💙💜🥰😍💖]/u,
    emotion: 'happy',
    state: 'HAPPY',
  },
  {
    pattern: /[👀🤔🧐]/u,
    emotion: 'curious',
    state: 'CURIOUS',
  },
  {
    pattern: /[😮😲🤯😳]/u,
    emotion: 'surprised',
    state: 'SURPRISED',
  },
  {
    pattern: /[😴🥱]/u,
    emotion: 'sleepy',
    state: 'SLEEPY',
  },
  {
    pattern: /[😭😢🥺]/u,
    emotion: 'sleepy',
    state: 'SLEEPY',
  },
  {
    pattern: /[😡😤🙄]/u,
    emotion: 'bored',
    state: 'BORED',
  },
  {
    pattern: /[👍👏🙌😎]/u,
    emotion: 'happy',
    state: 'HAPPY',
  },
]

function detectEmojiReaction(text: string) {
  return (
    emojiRules.find((rule) =>
      rule.pattern.test(text),
    ) ?? null
  )
}

function mapEmotionToState(
  emotion: NemoMood,
): NemoState {
  const map: Record<
    NemoMood,
    NemoState
  > = {
    neutral: 'IDLE',
    happy: 'HAPPY',
    curious: 'CURIOUS',
    thinking: 'THINKING',
    sleepy: 'SLEEPY',
    surprised: 'SURPRISED',
    bored: 'BORED',
    excited: 'EXCITED',
  }

  return map[emotion]
}

function randomOfflineReply() {
  return offlineReplies[
    Math.floor(
      Math.random() *
        offlineReplies.length,
    )
  ]
}

export default function App() {
  const [introVisible, setIntroVisible] =
    useState(true)

  const [introRunning, setIntroRunning] =
    useState(false)

  const [immersive, setImmersive] =
    useState(false)

  const [state, setState] =
    useState<NemoState>('IDLE')

  const [emotion, setEmotion] =
    useState<NemoMood>('neutral')

  const [mood, setMood] =
    useState<Mood>(initialMood)

  const [gaze, setGaze] =
    useState({
      x: 0,
      y: 0,
    })

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'heyyy 👀 I’m NEMO. Press my voice button or type something.',
      },
    ])

  const [speaking, setSpeaking] =
    useState(false)

  const [voiceEnabled, setVoiceEnabled] =
    useState(true)

  const [voiceLoop, setVoiceLoop] =
    useState(false)

  const [listening, setListening] =
    useState(false)

  const [offline, setOffline] =
    useState(false)

  const [gamesOpen, setGamesOpen] =
    useState(false)

  const recognitionRef =
    useRef<NemoSpeechRecognition | null>(null)

  const lastInteraction =
    useRef(Date.now())

  const voiceLoopRef =
    useRef(false)

  const voiceSupported = useMemo(
    () =>
      speechRecognitionSupported(),
    [],
  )

  

  
  useEffect(() => {
    voiceLoopRef.current = voiceLoop
  }, [voiceLoop])
  
  useEffect(() => {
  const timer =
    window.setTimeout(() => {
      void preloadVoice()
    }, 1200)

  return () =>
    window.clearTimeout(timer)
}, [])

  // ----------------------------------------------------------
  // Mouse gaze
  // ----------------------------------------------------------

  useEffect(() => {
  const timer = window.setTimeout(() => {
    preloadVoice()
  }, 1200)

  return () => {
    window.clearTimeout(timer)
  }
}, [])
  
  useEffect(() => {
    const onMove = (
      event: MouseEvent,
    ) => {
      const x =
        ((event.clientX /
          window.innerWidth) -
          0.5) *
        2

      const y =
        ((event.clientY /
          window.innerHeight) -
          0.5) *
        2

      setGaze({
        x: Math.max(
          -12,
          Math.min(12, x * 12),
        ),

        y: Math.max(
          -8,
          Math.min(8, y * 8),
        ),
      })

      lastInteraction.current =
        Date.now()
    }

    window.addEventListener(
      'mousemove',
      onMove,
      { passive: true },
    )

    return () =>
      window.removeEventListener(
        'mousemove',
        onMove,
      )
  }, [])

  // ----------------------------------------------------------
  // Autonomous personality
  // ----------------------------------------------------------

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setMood((current) => {
          const idle =
            moodAfterIdle(current)

          setState((currentState) => {
            if (
              [
                'THINKING',
                'SPEAKING',
                'LISTENING',
                'PLAYING',
              ].includes(
                currentState,
              )
            ) {
              return currentState
            }

            const decision =
              chooseIdleState(
                idle,
              )

            setEmotion(
              decision.emotion,
            )

            return decision.state
          })

          return idle
        })
      }, 3600)

    return () =>
      window.clearInterval(timer)
  }, [])

  // ----------------------------------------------------------
  // Sleep / inactivity
  // ----------------------------------------------------------

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        const inactiveFor =
          Date.now() -
          lastInteraction.current

        if (
          inactiveFor > 22_000 &&
          !speaking &&
          !listening &&
          !gamesOpen
        ) {
          setEmotion('sleepy')
          setState('SLEEPY')
        }
      }, 5000)

    return () =>
      window.clearInterval(timer)
  }, [
    speaking,
    listening,
    gamesOpen,
  ])

  // ----------------------------------------------------------
  // Intro sequence
  // ----------------------------------------------------------

const wakeNemo = async () => {
  if (introRunning) return

  setIntroRunning(true)
  setState('THINKING')
  setEmotion('curious')

  const introText =
    'Helloooo! I’m NEMO! I live right here in your browser. Okay okay… let’s have some fun!'

  let finished = false

  const finishIntro = () => {
    if (finished) return

    finished = true

    setSpeaking(false)
    setIntroVisible(false)
    setImmersive(true)
    setState('IDLE')
    setEmotion('neutral')

    void document.documentElement
      .requestFullscreen?.()
      .catch(() => undefined)
  }

  /*
    IMPORTANT:
    Don't await Kokoro here.
    Voice loading must never control
    whether the UI can continue.
  */
  void speak(
    introText,
    {
      rate: 1.10,
      pitch: 1.72,

      onStart: () => {
        setSpeaking(true)
        setState('SPEAKING')
        setEmotion('excited')
      },

      onEnd: () => {
        setSpeaking(false)

        window.setTimeout(
          finishIntro,
          350,
        )
      },
    },
  )

  /*
    Safety timeout:
    NEMO enters the main experience
    even if the first TTS inference
    is slow or fails.
  */
  window.setTimeout(
    finishIntro,
    7000,
  )
}

  // ----------------------------------------------------------
  // Reaction helper
  // ----------------------------------------------------------

  const react = (
    nextEmotion: NemoMood,
    nextState =
      mapEmotionToState(
        nextEmotion,
      ),
  ) => {
    lastInteraction.current =
      Date.now()

    setMood((current) =>
      moodAfterInteraction(current),
    )

    setEmotion(nextEmotion)
    setState(nextState)
  }

  // ----------------------------------------------------------
  // Speaking
  // ----------------------------------------------------------

  const speakNemo = (
    text: string,
  ) => {
    if (!voiceEnabled) {
      return false
    }

    return speak(
      text,
      {
        /*
          Higher pitch gives NEMO
          the silly/goofy character.
        */
        pitch: 1.66,
        rate: 1.08,

        onStart: () => {
          setSpeaking(true)
          setState('SPEAKING')
        },

        onEnd: () => {
          setSpeaking(false)

          if (
            voiceLoopRef.current
          ) {
            setState('IDLE')
            setEmotion('curious')

            window.setTimeout(() => {
              if (
                voiceLoopRef.current
              ) {
                startListening()
              }
            }, 280)
          } else {
            setState('IDLE')
            setEmotion('neutral')
          }
        },
      },
    )
  }

  // ----------------------------------------------------------
  // Chat
  // ----------------------------------------------------------

  const sendMessage = async (
    text: string,
  ) => {
    const trimmed =
      text.trim()

    if (!trimmed) {
      return
    }

    recognitionRef.current?.abort()
    setListening(false)

    lastInteraction.current =
      Date.now()

    const localReaction =
      detectEmojiReaction(
        trimmed,
      )

    if (localReaction) {
      setEmotion(
        localReaction.emotion,
      )
      setState(
        localReaction.state,
      )
    } else {
      setEmotion('curious')
      setState('THINKING')
    }

    const userMessage: ChatMessage =
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      }

    setMessages((current) => [
      ...current,
      userMessage,
    ])

    try {
      const response =
        await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            message: trimmed,
            history:
              messages
                .slice(-8)
                .map(
                  ({
                    role,
                    content,
                  }) => ({
                    role,
                    content,
                  }),
                ),
          }),
        })

      if (!response.ok) {
        throw new Error(
          'chat failed',
        )
      }

      const data =
        (await response.json()) as ChatResponse

      const reply =
        data.reply ||
        'uhhh… my tiny brain exploded.'

      setMessages((current) => [
        ...current,

        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
        },
      ])

      setOffline(false)

      const reaction =
        detectEmojiReaction(
          reply,
        )

      const nextEmotion =
        reaction?.emotion ??
        data.emotion ??
        'happy'

      const nextState =
        reaction?.state ??
        mapEmotionToState(
          nextEmotion,
        )

      setEmotion(nextEmotion)
      setState(nextState)

      if (
        data.shouldSpeak !== false
      ) {
        speakNemo(reply)
      }
    } catch {
      const fallback =
        randomOfflineReply()

      setOffline(true)

      setMessages((current) => [
        ...current,

        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            fallback.reply,
        },
      ])

      setEmotion(
        fallback.emotion,
      )
      setState('ERROR')

      speakNemo(
        fallback.reply,
      )
    }
  }

  // ----------------------------------------------------------
  // Voice recognition
  // ----------------------------------------------------------

  const startListening = () => {
    if (!voiceSupported) {
      react('sleepy', 'SLEEPY')
      return
    }

    recognitionRef.current?.abort()

    const recognition =
      createSpeechRecognition()

    if (!recognition) {
      return
    }

    recognition.lang =
      navigator.language ||
      'en-IN'

    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setSpeaking(false)
      setState('LISTENING')
      setEmotion('curious')

      lastInteraction.current =
        Date.now()
    }

    recognition.onresult = (
      event,
    ) => {
      const transcript =
        event.results[0]?.[0]?.transcript?.trim() ??
        ''

      setListening(false)

      if (transcript) {
        void sendMessage(
          transcript,
        )
      }
    }

    recognition.onerror = () => {
      setListening(false)

      if (
        voiceLoopRef.current
      ) {
        setState('IDLE')
        setEmotion('neutral')
      }
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current =
      recognition

    try {
      recognition.start()
    } catch {
      setListening(false)
    }
  }

  const toggleVoiceLoop = () => {
    if (voiceLoop) {
      setVoiceLoop(false)
      voiceLoopRef.current = false

      recognitionRef.current?.stop()
      recognitionRef.current?.abort()

      setListening(false)
      setState('IDLE')
      setEmotion('neutral')

      return
    }

    if (!voiceSupported) {
      react('sleepy', 'SLEEPY')
      return
    }

    setVoiceLoop(true)
    voiceLoopRef.current = true

    startListening()
  }

  // ----------------------------------------------------------
  // Fullscreen
  // ----------------------------------------------------------

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setImmersive(false)
      return
    }

    try {
      await document.documentElement.requestFullscreen()
      setImmersive(true)
    } catch {
      setImmersive(true)
    }
  }

  // ----------------------------------------------------------
  // Voice toggle
  // ----------------------------------------------------------

  const toggleVoiceOutput = () => {
    if (voiceEnabled) {
      cancelSpeech()
      setSpeaking(false)
    }

    setVoiceEnabled(
      (current) => !current,
    )
  }

  const moodLabel = useMemo(() => {
    if (mood.sleepiness > 76) {
      return 'sleepy'
    }

    if (mood.boredom > 70) {
      return 'bored'
    }

    if (mood.happiness > 84) {
      return 'happy'
    }

    if (mood.energy > 80) {
      return 'chaotic'
    }

    return 'curious'
  }, [mood])

  return (
    <main
      className={[
        'app',
        immersive
          ? 'immersive'
          : '',
        introVisible
          ? 'intro-active'
          : '',
      ].join(' ')}
    >

      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      {/* =======================================================
          INTRO
          ======================================================= */}

      {introVisible && (
        <section className="intro-screen">

          <div className="intro-grid" />

          <div className="intro-logo">
            <div className="intro-orbit">
              N
            </div>

            <span>
              NEMO / ONLINE
            </span>
          </div>

          <div className="intro-copy">
            <span className="intro-kicker">
              a tiny creature is waking up
            </span>

            <h1>
              Meet NEMO.
            </h1>

            <p>
              An AI creature
              that lives in
              your browser.
            </p>
          </div>

          <button
            className="wake-button"
            onClick={() =>
              void wakeNemo()
            }
            disabled={introRunning}
          >
            <Sparkles size={17} />

            {introRunning
              ? 'NEMO IS WAKING…'
              : 'LET NEMO WAKE UP'}
          </button>

          <div className="intro-foot">
            camera and microphone
            stay off until you
            choose to enable them
          </div>

        </section>
      )}

      {!introVisible && (
        <>
          <header className="topbar">

            <div className="brand">

              <div className="brand-mark">
                N
              </div>

              <div>
                <strong>
                  NEMO
                </strong>

                <span>
                  tiny browser creature
                </span>
              </div>

            </div>

            <div className="top-actions">

              <div className="presence">
                <i />

                {offline
                  ? 'offline'
                  : voiceLoop
                    ? 'voice loop active'
                    : 'local systems online'}
              </div>

              <button
                className="icon-btn"
                onClick={
                  toggleFullscreen
                }
                title={
                  immersive
                    ? 'Exit fullscreen'
                    : 'Fullscreen NEMO'
                }
              >
                {immersive
                  ? <Minimize2 size={17} />
                  : <Maximize2 size={17} />}
              </button>

            </div>

          </header>

          <section className="stage">

            <div className="stage-copy">

              <div className="eyebrow">
                <Sparkles size={14} />
                NEMO / ALIVE
              </div>

              <h1>
                A tiny AI creature
                <br />
                <em>
                  that refuses to be boring.
                </em>
              </h1>

              <p>
                NEMO reacts to your mouse,
                talks with you,
                changes mood, gets sleepy,
                and makes its own little
                decisions while you are quiet.
              </p>

              <div className="feature-pills">
                <span>autonomy</span>
                <span>voice</span>
                <span>games</span>
                <span>emotions</span>
              </div>

            </div>

            <div className="creature-wrap">

              <div className="mood-chip">
                <span>
                  {moodLabel}
                </span>

                <b>
                  {state.toLowerCase()}
                </b>
              </div>

              <Nemo
                state={state}
                mood={emotion}
                gazeX={gaze.x}
                gazeY={gaze.y}
                onClick={() =>
                  react(
                    'surprised',
                    'SURPRISED',
                  )
                }
              />

              <div className="floor-shadow" />

              <div className="hint">
                move around / click / talk
              </div>

            </div>

            <Chat
              messages={messages}
              onSend={sendMessage}
              onVoice={
                startListening
              }
              speaking={speaking}
              listening={listening}
              voiceSupported={
                voiceSupported
              }
              voiceLoop={
                voiceLoop
              }
            />

          </section>

          {gamesOpen && (
            <Games
              onNemoReact={(
                nextEmotion,
              ) => {
                setState('PLAYING')
                setEmotion(
                  nextEmotion,
                )

                window.setTimeout(
                  () => {
                    setState('IDLE')
                  },
                  800,
                )
              }}
            />
          )}

          <footer className="hud">

            <div className="hud-left">

              <span className="hud-item">
                <i className="pulse" />
                NEMO / 0.3.0
              </span>

              <span className="hud-item">
                <Moon size={13} />
                {moodLabel}
              </span>

            </div>

            <div className="hud-actions">

              <button
                className={
                  `hud-btn ${
                    voiceLoop
                      ? 'selected'
                      : ''
                  }`
                }
                onClick={
                  toggleVoiceLoop
                }
              >
                {voiceLoop
                  ? <MicOff size={15} />
                  : <Mic size={15} />}

                {voiceLoop
                  ? 'voice loop on'
                  : 'voice loop'}
              </button>

              <button
                className="hud-btn"
                onClick={
                  toggleVoiceOutput
                }
              >
                {voiceEnabled
                  ? <Volume2 size={15} />
                  : <VolumeX size={15} />}

                {voiceEnabled
                  ? 'voice'
                  : 'muted'}
              </button>

              <button
                className={
                  `hud-btn ${
                    gamesOpen
                      ? 'selected'
                      : ''
                  }`
                }
                onClick={() =>
                  setGamesOpen(
                    (current) =>
                      !current,
                  )
                }
              >
                <Gamepad2 size={15} />
                games
              </button>

            </div>

          </footer>
        </>
      )}

    </main>
  )
}
