'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const GRID = 20
const CELL = 24
const INITIAL_SPEED = 150

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Point = { x: number; y: number }

function randomFood(snake: Point[]): Point {
  let p: Point
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
  } while (snake.some(s => s.x === p.x && s.y === p.y))
  return p
}

const INIT_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 9,  y: 10 },
  { x: 8,  y: 10 },
]

export default function SnakePage() {
  const [snake, setSnake]     = useState<Point[]>(INIT_SNAKE)
  const [food, setFood]       = useState<Point>({ x: 15, y: 10 })
  const [dir, setDir]         = useState<Dir>('RIGHT')
  const [status, setStatus]   = useState<'idle' | 'running' | 'over'>('idle')
  const [score, setScore]     = useState(0)
  const [best, setBest]       = useState(0)
  const [speed, setSpeed]     = useState(INITIAL_SPEED)

  const dirRef    = useRef<Dir>('RIGHT')
  const snakeRef  = useRef<Point[]>(INIT_SNAKE)
  const foodRef   = useRef<Point>({ x: 15, y: 10 })
  const scoreRef  = useRef(0)
  const speedRef  = useRef(INITIAL_SPEED)
  const statusRef = useRef<'idle' | 'running' | 'over'>('idle')
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load best score
  useEffect(() => {
    const saved = localStorage.getItem('snake-best')
    if (saved) setBest(parseInt(saved))
  }, [])

  const tick = useCallback(() => {
    if (statusRef.current !== 'running') return

    const head = snakeRef.current[0]
    const d = dirRef.current
    const next: Point = {
      x: d === 'LEFT' ? head.x - 1 : d === 'RIGHT' ? head.x + 1 : head.x,
      y: d === 'UP'   ? head.y - 1 : d === 'DOWN'  ? head.y + 1 : head.y,
    }

    // Wall collision
    if (next.x < 0 || next.x >= GRID || next.y < 0 || next.y >= GRID) {
      statusRef.current = 'over'
      setStatus('over')
      const s = scoreRef.current
      setBest(prev => {
        const nb = Math.max(prev, s)
        localStorage.setItem('snake-best', String(nb))
        return nb
      })
      return
    }

    // Self collision (skip tail tip since it will move)
    const body = snakeRef.current.slice(0, -1)
    if (body.some(p => p.x === next.x && p.y === next.y)) {
      statusRef.current = 'over'
      setStatus('over')
      const s = scoreRef.current
      setBest(prev => {
        const nb = Math.max(prev, s)
        localStorage.setItem('snake-best', String(nb))
        return nb
      })
      return
    }

    const ateFood = next.x === foodRef.current.x && next.y === foodRef.current.y
    const newSnake = ateFood
      ? [next, ...snakeRef.current]
      : [next, ...snakeRef.current.slice(0, -1)]

    snakeRef.current = newSnake
    setSnake([...newSnake])

    if (ateFood) {
      const ns = scoreRef.current + 10
      scoreRef.current = ns
      setScore(ns)
      const nf = randomFood(newSnake)
      foodRef.current = nf
      setFood({ ...nf })
      // Speed up every 50 pts
      const newSpeed = Math.max(60, INITIAL_SPEED - Math.floor(ns / 50) * 15)
      speedRef.current = newSpeed
      setSpeed(newSpeed)
    }

    timerRef.current = setTimeout(tick, speedRef.current)
  }, [])

  const start = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const initSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    const initFood  = randomFood(initSnake)
    snakeRef.current  = initSnake
    foodRef.current   = initFood
    dirRef.current    = 'RIGHT'
    scoreRef.current  = 0
    speedRef.current  = INITIAL_SPEED
    statusRef.current = 'running'
    setSnake(initSnake)
    setFood(initFood)
    setDir('RIGHT')
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setStatus('running')
    timerRef.current = setTimeout(tick, INITIAL_SPEED)
  }, [tick])

  // Keyboard
  useEffect(() => {
    const MAP: Record<string, Dir> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      z: 'UP', q: 'LEFT', Z: 'UP', Q: 'LEFT',
    }
    const OPPOSITE: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }

    function onKey(e: KeyboardEvent) {
      const d = MAP[e.key]
      if (!d) return
      e.preventDefault()
      if (statusRef.current === 'idle' || statusRef.current === 'over') {
        start()
        return
      }
      if (d !== OPPOSITE[dirRef.current]) {
        dirRef.current = d
        setDir(d)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [start])

  // Touch swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    const OPPOSITE: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
    let d: Dir
    if (Math.abs(dx) > Math.abs(dy)) {
      d = dx > 0 ? 'RIGHT' : 'LEFT'
    } else {
      d = dy > 0 ? 'DOWN' : 'UP'
    }
    if (statusRef.current === 'idle' || statusRef.current === 'over') { start(); return }
    if (d !== OPPOSITE[dirRef.current]) { dirRef.current = d; setDir(d) }
    touchStart.current = null
  }

  const size = GRID * CELL

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Snake</h1>
        <p className="text-gray-500 text-sm mt-1">Flèches / ZQSD · Swipe sur mobile</p>
      </div>

      {/* Scores */}
      <div className="flex gap-8">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Score</p>
          <p className="text-2xl font-bold text-emerald-400">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Meilleur</p>
          <p className="text-2xl font-bold text-amber-400">{Math.max(best, score)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Vitesse</p>
          <p className="text-2xl font-bold text-sky-400">{Math.round((INITIAL_SPEED / speed) * 100)}%</p>
        </div>
      </div>

      {/* Grid */}
      <div
        className="relative border border-white/10 rounded-xl overflow-hidden bg-[#0d0d0d] cursor-pointer select-none"
        style={{ width: size, height: size }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => { if (status === 'idle' || status === 'over') start() }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 opacity-5" width={size} height={size}>
          {Array.from({ length: GRID + 1 }).map((_, i) => (
            <g key={i}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={size} stroke="white" strokeWidth="0.5" />
              <line x1={0} y1={i * CELL} x2={size} y2={i * CELL} stroke="white" strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        {/* Food */}
        <div
          className="absolute rounded-full bg-red-500 shadow-lg shadow-red-500/50"
          style={{
            width: CELL - 4, height: CELL - 4,
            left: food.x * CELL + 2, top: food.y * CELL + 2,
            transition: 'left 0.05s, top 0.05s',
          }}
        />

        {/* Snake */}
        {snake.map((p, i) => (
          <div
            key={`${p.x}-${p.y}-${i}`}
            className="absolute rounded-sm"
            style={{
              width: CELL - 2, height: CELL - 2,
              left: p.x * CELL + 1, top: p.y * CELL + 1,
              background: i === 0
                ? '#10b981'
                : `hsl(${160 - i * 2}, ${80 - i}%, ${45 - i * 0.3}%)`,
              boxShadow: i === 0 ? '0 0 8px #10b98180' : undefined,
            }}
          />
        ))}

        {/* Overlay */}
        {status !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
            {status === 'over' && (
              <p className="text-red-400 font-bold text-xl">Game Over</p>
            )}
            <p className="text-white font-semibold text-lg">
              {status === 'over' ? `Score : ${score}` : 'Snake'}
            </p>
            <button
              onClick={start}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              {status === 'over' ? 'Rejouer' : 'Jouer'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        {(['UP', 'DOWN', 'LEFT', 'RIGHT'] as Dir[]).map(d => {
          const OPPOSITE: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
          const labels = { UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶' }
          const pos = {
            UP:    'col-start-2 row-start-1',
            LEFT:  'col-start-1 row-start-2',
            DOWN:  'col-start-2 row-start-2',
            RIGHT: 'col-start-3 row-start-2',
          }
          return (
            <div key={d} className="grid grid-cols-3 grid-rows-2 gap-2 absolute" style={{ display: 'none' }} />
          )
        })}
        <div className="grid grid-cols-3 gap-2">
          {[null, 'UP', null, 'LEFT', 'DOWN', 'RIGHT'].map((d, i) => (
            d ? (
              <button
                key={d}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-lg active:scale-95 transition-all"
                onTouchEnd={(e) => {
                  e.preventDefault()
                  const OPPOSITE: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
                  const nd = d as Dir
                  if (statusRef.current === 'idle' || statusRef.current === 'over') { start(); return }
                  if (nd !== OPPOSITE[dirRef.current]) { dirRef.current = nd; setDir(nd) }
                }}
              >
                {d === 'UP' ? '▲' : d === 'DOWN' ? '▼' : d === 'LEFT' ? '◀' : '▶'}
              </button>
            ) : <div key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
