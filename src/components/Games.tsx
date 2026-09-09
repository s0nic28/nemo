import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Brain,
  Circle,
  Gamepad2,
  MousePointer2,
  Scissors,
  Sparkles,
  Zap,
} from 'lucide-react'

type Props = {
  onNemoReact: (
    emotion:
      | 'happy'
      | 'curious'
      | 'surprised'
      | 'excited'
      | 'sleepy'
  ) => void
}

type RpsChoice =
  | 'rock'
  | 'paper'
  | 'scissors'

const RPS: RpsChoice[] = [
  'rock',
  'paper',
  'scissors',
]

const emojis = [
  '🍎',
  '🚀',
  '🐸',
  '⭐',
]

export default function Games({
  onNemoReact,
}: Props) {
  const [tab, setTab] =
    useState<'rps' | 'ttt' | 'reaction' | 'memory' | 'catch'>(
      'rps',
    )

  return (
    <section
      className="games-drawer"
      aria-label="NEMO games"
    >

      <div className="games-title">
        <div>
          <Gamepad2 size={16} />
          <strong>PLAY WITH NEMO</strong>
        </div>

        <span>
          tiny games / big reactions
        </span>
      </div>

      <div className="game-tabs">

        <button
          className={
            tab === 'rps' ? 'active' : ''
          }
          onClick={() => setTab('rps')}
        >
          <Scissors size={14} />
          RPS
        </button>

        <button
          className={
            tab === 'ttt' ? 'active' : ''
          }
          onClick={() => setTab('ttt')}
        >
          <Circle size={14} />
          Tic Tac Toe
        </button>

        <button
          className={
            tab === 'reaction'
              ? 'active'
              : ''
          }
          onClick={() => setTab('reaction')}
        >
          <Zap size={14} />
          Reaction
        </button>

        <button
          className={
            tab === 'memory' ? 'active' : ''
          }
          onClick={() =>
            setTab('memory')
          }
        >
          <Brain size={14} />
          Memory
        </button>

        <button
          className={
            tab === 'catch' ? 'active' : ''
          }
          onClick={() =>
            setTab('catch')
          }
        >
          <MousePointer2 size={14} />
          Catch
        </button>

      </div>

      <div className="game-stage">

        {tab === 'rps' && (
          <RockPaperScissors
            onNemoReact={onNemoReact}
          />
        )}

        {tab === 'ttt' && (
          <TicTacToe
            onNemoReact={onNemoReact}
          />
        )}

        {tab === 'reaction' && (
          <ReactionGame
            onNemoReact={onNemoReact}
          />
        )}

        {tab === 'memory' && (
          <MemoryGame
            onNemoReact={onNemoReact}
          />
        )}

        {tab === 'catch' && (
          <CatchGame
            onNemoReact={onNemoReact}
          />
        )}

      </div>

    </section>
  )
}

function RockPaperScissors({
  onNemoReact,
}: Props) {
  const [result, setResult] =
    useState(
      'Pick one. NEMO is watching 👀',
    )

  const [nemoChoice, setNemoChoice] =
    useState<RpsChoice | null>(null)

  const choose = (
    userChoice: RpsChoice,
  ) => {
    const nemo =
      RPS[Math.floor(Math.random() * 3)]

    setNemoChoice(nemo)

    if (userChoice === nemo) {
      setResult('DRAW! We are equally powerful.')
      onNemoReact('surprised')
      return
    }

    const userWins =
      (userChoice === 'rock' &&
        nemo === 'scissors') ||
      (userChoice === 'paper' &&
        nemo === 'rock') ||
      (userChoice === 'scissors' &&
        nemo === 'paper')

    if (userWins) {
      setResult('YOU WIN 😭 NEMO is devastated.')
      onNemoReact('sleepy')
    } else {
      setResult('NEMO WINS. hehehehehe.')
      onNemoReact('excited')
    }
  }

  return (
    <div className="game-card">

      <Sparkles size={17} />

      <h3>Rock Paper Scissors</h3>

      <p>{result}</p>

      <div className="game-big-result">
        {nemoChoice
          ? `NEMO: ${nemoChoice}`
          : '—'}
      </div>

      <div className="game-actions">

        <button
          onClick={() => choose('rock')}
        >
          🪨 Rock
        </button>

        <button
          onClick={() =>
            choose('paper')
          }
        >
          📄 Paper
        </button>

        <button
          onClick={() =>
            choose('scissors')
          }
        >
          ✂️ Scissors
        </button>

      </div>

    </div>
  )
}

function TicTacToe({
  onNemoReact,
}: Props) {
  const empty =
    Array(9).fill(null) as Array<
      'X' | 'O' | null
    >

  const [board, setBoard] =
    useState(empty)

  const [message, setMessage] =
    useState('Your move.')

  const winner = checkWinner(board)

  const reset = () => {
    setBoard([...empty])
    setMessage('Your move.')
  }

  const click = (index: number) => {
    if (
      board[index] ||
      winner
    ) {
      return
    }

    const next = [...board]
    next[index] = 'X'

    const userWinner =
      checkWinner(next)

    if (userWinner) {
      setBoard(next)
      setMessage('NOOOO. You beat NEMO!')
      onNemoReact('sleepy')
      return
    }

    const free =
      next
        .map((cell, i) =>
          cell ? -1 : i,
        )
        .filter((i) => i >= 0)

    if (!free.length) {
      setBoard(next)
      setMessage('Draw! suspicious...')
      onNemoReact('surprised')
      return
    }

    const nemoIndex =
      free[
        Math.floor(
          Math.random() * free.length,
        )
      ]

    next[nemoIndex] = 'O'

    const nemoWinner =
      checkWinner(next)

    if (nemoWinner) {
      setMessage('NEMO TAKES THE WIN 😎')
      onNemoReact('excited')
    } else {
      setMessage('Your move.')
      onNemoReact('curious')
    }

    setBoard(next)
  }

  return (
    <div className="game-card">

      <h3>Tic Tac Toe</h3>

      <p>{message}</p>

      <div className="ttt-grid">

        {board.map(
          (cell, index) => (
            <button
              key={index}
              onClick={() =>
                click(index)
              }
            >
              {cell}
            </button>
          ),
        )}

      </div>

      <button
        className="game-reset"
        onClick={reset}
      >
        restart
      </button>

    </div>
  )
}

function checkWinner(
  board: Array<'X' | 'O' | null>,
) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a]
    }
  }

  return null
}

function ReactionGame({
  onNemoReact,
}: Props) {
  const [running, setRunning] =
    useState(false)

  const [ready, setReady] =
    useState(false)

  const [startAt, setStartAt] =
    useState(0)

  const [score, setScore] =
    useState<number | null>(null)

  const begin = () => {
    setRunning(true)
    setReady(false)
    setScore(null)

    const delay =
      1300 + Math.random() * 2500

    window.setTimeout(() => {
      setReady(true)
      setStartAt(
        performance.now(),
      )
    }, delay)
  }

  const hit = () => {
    if (!running || !ready) {
      onNemoReact('surprised')
      return
    }

    const result =
      performance.now() - startAt

    setScore(
      Math.round(result),
    )

    setRunning(false)
    setReady(false)

    if (result < 350) {
      onNemoReact('excited')
    } else {
      onNemoReact('happy')
    }
  }

  return (
    <div className="game-card">

      <h3>Reaction Test</h3>

      <p>
        {score !== null
          ? `${score} ms — nice!`
          : ready
            ? 'NOW! NOW! NOW!'
            : 'Wait for NEMO…'}
      </p>

      <button
        className={
          `reaction-zone ${
            ready ? 'ready' : ''
          }`
        }
        onClick={hit}
        disabled={
          !running &&
          !ready
        }
      >
        {running
          ? ready
            ? 'CLICK!'
            : '…'
          : 'START'}
      </button>

      {!running && (
        <button
          className="game-reset"
          onClick={begin}
        >
          {score === null
            ? 'start test'
            : 'again'}
        </button>
      )}

    </div>
  )
}

function MemoryGame({
  onNemoReact,
}: Props) {
  const deck =
    useMemo(
      () => [
        ...emojis,
        ...emojis,
      ]
        .map((emoji, index) => ({
          id: index,
          emoji,
        }))
        .sort(() => Math.random() - 0.5),
      [],
    )

  const [opened, setOpened] =
    useState<number[]>([])

  const [matched, setMatched] =
    useState<number[]>([])

  const click = (id: number) => {
    if (
      opened.includes(id) ||
      matched.includes(id) ||
      opened.length >= 2
    ) {
      return
    }

    const next =
      [...opened, id]

    setOpened(next)

    if (next.length !== 2) {
      return
    }

    const first =
      deck.find(
        (item) => item.id === next[0],
      )!

    const second =
      deck.find(
        (item) => item.id === next[1],
      )!

    if (
      first.emoji === second.emoji
    ) {
      setMatched((current) => [
        ...current,
        next[0],
        next[1],
      ])

      setOpened([])

      onNemoReact('happy')
    } else {
      window.setTimeout(() => {
        setOpened([])
        onNemoReact('curious')
      }, 550)
    }
  }

  return (
    <div className="game-card">

      <h3>Memory</h3>

      <p>
        Find the pairs.
      </p>

      <div className="memory-grid">

        {deck.map((item) => {
          const visible =
            opened.includes(item.id) ||
            matched.includes(item.id)

          return (
            <button
              key={item.id}
              className={
                visible
                  ? 'memory-card open'
                  : 'memory-card'
              }
              onClick={() =>
                click(item.id)
              }
            >
              {visible
                ? item.emoji
                : '•'}
            </button>
          )
        })}

      </div>

    </div>
  )
}

function CatchGame({
  onNemoReact,
}: Props) {
  const [position, setPosition] =
    useState({
      left: 42,
      top: 45,
    })

  const [score, setScore] =
    useState(0)

  const moveDot = () => {
    setPosition({
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 70,
    })

    setScore(
      (current) => current + 1,
    )

    onNemoReact('excited')
  }

  return (
    <div className="game-card">

      <h3>Catch the Dot</h3>

      <p>
        Caught: {score}
      </p>

      <div className="catch-zone">

        <button
          className="catch-dot"
          style={{
            left: `${position.left}%`,
            top: `${position.top}%`,
          }}
          onClick={moveDot}
          aria-label="Catch the dot"
        >
          ✦
        </button>

      </div>

    </div>
  )
}
