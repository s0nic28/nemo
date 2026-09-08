import { useState } from 'react'
import { ArrowUp, Volume2 } from 'lucide-react'
import type { ChatMessage } from '../types'

export default function Chat({ messages, onSend, speaking }: { messages: ChatMessage[]; onSend: (text: string) => void; speaking: boolean }) {
  const [value, setValue] = useState('')
  const submit = () => {
    const next = value.trim()
    if (!next) return
    onSend(next)
    setValue('')
  }

  return (
    <section className="chat-panel" aria-label="Chat with NEMO">
      <div className="chat-head">
        <div><strong>NEMO</strong><span>browser creature</span></div>
        <div className="status-dot"><i /> {speaking ? 'speaking' : 'alive'}</div>
      </div>
      <div className="messages">
        {messages.slice(-5).map((message) => (
          <div key={message.id} className={`bubble ${message.role}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="composer">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
          placeholder="Talk to NEMO..."
          aria-label="Message NEMO"
        />
        <button onClick={submit} aria-label="Send message"><ArrowUp size={17} /></button>
      </div>
      <div className="chat-meta"><Volume2 size={13} /> browser speech synthesis</div>
    </section>
  )
}
