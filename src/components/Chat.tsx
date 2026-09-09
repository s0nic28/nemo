import { useState } from 'react'

import {
  ArrowUp,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react'

import type {
  ChatMessage,
} from '../types'

type Props = {
  messages: ChatMessage[]
  onSend: (text: string) => void
  onVoice: () => void
  speaking: boolean
  listening: boolean
  voiceSupported: boolean
  voiceLoop: boolean
}

export default function Chat({
  messages,
  onSend,
  onVoice,
  speaking,
  listening,
  voiceSupported,
  voiceLoop,
}: Props) {
  const [value, setValue] =
    useState('')

  const submit = () => {
    const text = value.trim()

    if (!text) return

    onSend(text)
    setValue('')
  }

  return (
    <section
      className="chat-panel"
      aria-label="Chat with NEMO"
    >

      <div className="chat-head">

        <div>
          <strong>NEMO</strong>

          <span>
            {voiceLoop
              ? 'voice loop active'
              : 'browser creature'}
          </span>
        </div>

        <div className="status-dot">

          <i />

          {listening
            ? 'listening'
            : speaking
              ? 'speaking'
              : 'alive'}

        </div>

      </div>

      <div className="messages">

        {messages
          .slice(-6)
          .map((message) => (
            <div
              key={message.id}
              className={`bubble ${message.role}`}
            >
              {message.content}
            </div>
          ))}

      </div>

      <div className="composer">

        <button
          className={
            `voice-input-btn ${
              listening
                ? 'is-listening'
                : ''
            }`
          }
          onClick={onVoice}
          disabled={!voiceSupported}
          aria-label={
            listening
              ? 'Stop listening'
              : 'Talk to NEMO'
          }
          title={
            !voiceSupported
              ? 'Speech recognition is unavailable'
              : listening
                ? 'Stop listening'
                : 'Talk to NEMO'
          }
        >

          {listening
            ? <MicOff size={17} />
            : <Mic size={17} />}

        </button>

        <input
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit()
            }
          }}
          placeholder={
            listening
              ? 'Listening…'
              : 'Say something…'
          }
          aria-label="Message NEMO"
        />

        <button
          onClick={submit}
          aria-label="Send"
        >
          <ArrowUp size={17} />
        </button>

      </div>

      <div className="chat-meta">

        <Volume2 size={13} />

        {voiceLoop
          ? 'voice → AI → voice'
          : 'text + browser voice'}

      </div>

    </section>
  )
}
