'use client'

import { useState, useEffect } from 'react'

type Zone = 'TL' | 'TC' | 'TR' | 'BL' | 'BC' | 'BR'
type Phase = 'idle' | 'shooting' | 'result'

const ZONES: Zone[] = ['TL', 'TC', 'TR', 'BL', 'BC', 'BR']

const ZONE_LABEL: Record<Zone, string> = {
  TL: 'Haut G', TC: 'Haut C', TR: 'Haut D',
  BL: 'Bas G',  BC: 'Bas C',  BR: 'Bas D',
}

// Position du ballon dans le but (en %)
const BALL_POS: Record<Zone, { x: number; y: number }> = {
  TL: { x: 18, y: 22 }, TC: { x: 50, y: 18 }, TR: { x: 82, y: 22 },
  BL: { x: 18, y: 68 }, BC: { x: 50, y: 65 }, BR: { x: 82, y: 68 },
}

// Position du gardien (bras tendus) selon sa plongée
const KEEPER_POS: Record<Zone, { x: number; rotate: number }> = {
  TL: { x: 20,  rotate: -40 },
  TC: { x: 50,  rotate: 0   },
  TR: { x: 80,  rotate: 40  },
  BL: { x: 20,  rotate: -15 },
  BC: { x: 50,  rotate: 0   },
  BR: { x: 80,  rotate: 15  },
}

function randomZone(): Zone {
  return ZONES[Math.floor(Math.random() * ZONES.length)]
}

export default function PenaltyPage() {
  const [phase, setPhase]         = useState<Phase>('idle')
  const [playerZone, setPlayer]   = useState<Zone | null>(null)
  const [keeperZone, setKeeper]   = useState<Zone>('BC')
  const [goals, setGoals]         = useState(0)
  const [shots, setShots]         = useState(0)
  const [isGoal, setIsGoal]       = useState(false)
  const [ballVisible, setBall]    = useState(false)
  const [keeperDiving, setDiving] = useState(false)
  const [streak, setStreak]       = useState(0)
  const [bestStreak, setBest]     = useState(0)

  function shoot(zone: Zone) {
    if (phase !== 'idle') return
    const kz = randomZone()
    const goal = zone !== kz

    setPlayer(zone)
    setKeeper(kz)
    setPhase('shooting')
    setBall(false)
    setDiving(false)

    // Légère pause avant l'animation
    setTimeout(() => {
      setBall(true)
      setDiving(true)
    }, 100)

    // Résultat après l'animation
    setTimeout(() => {
      setIsGoal(goal)
      setPhase('result')
      setShots(s => s + 1)
      if (goal) {
        setGoals(g => g + 1)
        setStreak(s => {
          const ns = s + 1
          setBest(b => Math.max(b, ns))
          return ns
        })
      } else {
        setStreak(0)
      }
    }, 900)

    // Retour à idle
    setTimeout(() => {
      setPhase('idle')
      setBall(false)
      setDiving(false)
      setPlayer(null)
    }, 2600)
  }

  function reset() {
    setGoals(0)
    setShots(0)
    setStreak(0)
    setPhase('idle')
    setBall(false)
    setDiving(false)
    setPlayer(null)
    setKeeper('BC')
  }

  const accuracy = shots > 0 ? Math.round((goals / shots) * 100) : 0
  const bp = playerZone ? BALL_POS[playerZone] : { x: 50, y: 90 }
  const kp = KEEPER_POS[keeperZone]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 gap-6 select-none">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">⚽ Penalty</h1>
        <p className="text-gray-500 text-sm mt-1">Choisis où tirer — le gardien plonge aléatoirement</p>
      </div>

      {/* Score bar */}
      <div className="flex gap-8 items-center">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Buts</p>
          <p className="text-3xl font-black text-emerald-400">{goals}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Tirs</p>
          <p className="text-3xl font-black text-white">{shots}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Précision</p>
          <p className="text-3xl font-black text-sky-400">{accuracy}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Série</p>
          <p className="text-3xl font-black text-amber-400">{streak} 🔥</p>
        </div>
      </div>

      {/* Goal + pitch */}
      <div className="relative w-full max-w-lg">
        {/* Pelouse */}
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(180deg, #1a4a1a 0%, #2d7a2d 40%, #1e5c1e 100%)' }}>

          {/* But SVG */}
          <div className="relative mx-auto" style={{ width: '85%', paddingTop: '55%' }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 220"
              preserveAspectRatio="none"
            >
              {/* Filet */}
              <defs>
                <pattern id="net" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect x="20" y="10" width="360" height="200" fill="url(#net)" />

              {/* Poteaux */}
              <rect x="18" y="8" width="8" height="205" fill="white" rx="3"/>
              <rect x="374" y="8" width="8" height="205" fill="white" rx="3"/>
              <rect x="18" y="8" width="364" height="8" fill="white" rx="3"/>
            </svg>

            {/* Zones cliquables */}
            {phase === 'idle' && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-3">
                {ZONES.map(zone => (
                  <button
                    key={zone}
                    onClick={() => shoot(zone)}
                    className="rounded-lg border-2 border-white/0 hover:border-white/40 hover:bg-white/15 transition-all duration-150 flex items-center justify-center text-white/0 hover:text-white/60 text-xs font-medium active:scale-95"
                  >
                    {ZONE_LABEL[zone]}
                  </button>
                ))}
              </div>
            )}

            {/* Gardien — 2× plus grand */}
            <div
              className="absolute bottom-2 pointer-events-none"
              style={{
                left: `${kp.x}%`,
                transform: `translateX(-50%) rotate(${keeperDiving ? kp.rotate : 0}deg)`,
                transition: keeperDiving ? 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                transformOrigin: 'bottom center',
              }}
            >
              <div className="flex flex-col items-center">
                {/* Tête */}
                <div className="w-6 h-6 rounded-full bg-amber-300 border-2 border-amber-500" />
                {/* Corps */}
                <div className="w-8 h-12 rounded-lg bg-yellow-500 border-2 border-yellow-600 -mt-1" />
                {/* Bras */}
                <div className="absolute top-5 flex gap-16">
                  <div
                    className="w-10 h-3 bg-amber-300 rounded-full border border-amber-400"
                    style={{ transform: keeperDiving ? 'rotate(-30deg)' : 'rotate(-10deg)', transition: 'transform 0.5s' }}
                  />
                  <div
                    className="w-10 h-3 bg-amber-300 rounded-full border border-amber-400"
                    style={{ transform: keeperDiving ? 'rotate(30deg)' : 'rotate(10deg)', transition: 'transform 0.5s' }}
                  />
                </div>
                {/* Jambes */}
                <div className="flex gap-2 -mt-1">
                  <div className="w-3 h-8 bg-yellow-700 rounded border border-yellow-800" style={{ transform: keeperDiving ? 'rotate(-20deg)' : 'none', transition: 'transform 0.5s' }} />
                  <div className="w-3 h-8 bg-yellow-700 rounded border border-yellow-800" style={{ transform: keeperDiving ? 'rotate(20deg)' : 'none', transition: 'transform 0.5s' }} />
                </div>
              </div>
            </div>

            {/* Ballon */}
            {ballVisible && playerZone && (
              <div
                className="absolute w-6 h-6 pointer-events-none z-10"
                style={{
                  left: `${bp.x}%`,
                  top: `${bp.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'ballFly 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                }}
              >
                ⚽
              </div>
            )}

            {/* Result overlay */}
            {phase === 'result' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`px-6 py-3 rounded-2xl text-2xl font-black border-2 backdrop-blur-sm ${
                  isGoal
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                    : 'bg-red-500/30 border-red-400 text-red-300'
                }`}
                  style={{ animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
                >
                  {isGoal ? '⚽ BUT !' : '🧤 ARRÊT !'}
                </div>
              </div>
            )}
          </div>

          {/* Zone de tir (point de penalty) */}
          <div className="flex justify-center pb-3 pt-1">
            <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>

          {/* Instructions */}
          {phase === 'idle' && (
            <div className="text-center pb-3">
              <p className="text-white/50 text-xs">Clique sur une zone dans le but pour tirer</p>
            </div>
          )}
          {phase === 'shooting' && (
            <div className="text-center pb-3">
              <p className="text-white/50 text-xs">…</p>
            </div>
          )}
        </div>

        {/* Zone hover labels */}
        {phase === 'idle' && (
          <div className="absolute inset-0 pointer-events-none flex items-start justify-center pt-2 gap-16 opacity-30">
          </div>
        )}
      </div>

      {/* Meilleure série */}
      {bestStreak > 0 && (
        <p className="text-gray-600 text-sm">Meilleure série : <span className="text-amber-400 font-bold">{bestStreak} buts</span> consécutifs</p>
      )}

      {/* Reset */}
      {shots > 0 && (
        <button
          onClick={reset}
          className="text-xs text-gray-600 hover:text-gray-300 transition-colors underline"
        >
          Réinitialiser
        </button>
      )}

      <style jsx>{`
        @keyframes ballFly {
          0%   { left: 50%; top: 85%; transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { left: ${playerZone ? bp.x : 50}%; top: ${playerZone ? bp.y : 50}%; transform: translate(-50%, -50%) scale(0.7); opacity: 1; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
