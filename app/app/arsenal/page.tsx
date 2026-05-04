'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ArrowRight, Trophy, Users, Calendar, Clock, Star, ChevronRight, Flame, Shield } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Match {
  id: number
  utcDate: string
  status: string
  matchday?: number
  homeTeam: { name: string; shortName: string; crest: string }
  awayTeam: { name: string; shortName: string; crest: string }
  score: { fullTime: { home: number | null; away: number | null }; halfTime: { home: number | null; away: number | null } }
  competition: { name: string; emblem: string }
}

interface StandingRow {
  position: number
  team: { id: number; name: string; shortName: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const PLAYERS = [
  // Gardiens
  { name: 'David Raya',           pos: 'GK',  num: 1,  nat: '🇪🇸', age: 30, photo: 'raya' },
  { name: 'Kepa Arrizabalaga',    pos: 'GK',  num: 13, nat: '🇪🇸', age: 31, photo: 'kepa' },
  { name: 'Tommy Setford',        pos: 'GK',  num: 35, nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 20, photo: 'setford' },
  // Défenseurs
  { name: 'William Saliba',       pos: 'DEF', num: 2,  nat: '🇫🇷', age: 25, photo: 'saliba' },
  { name: 'Gabriel Magalhães',    pos: 'DEF', num: 6,  nat: '🇧🇷', age: 28, photo: 'gabriel' },
  { name: 'Piero Hincapié',       pos: 'DEF', num: 5,  nat: '🇪🇨', age: 24, photo: 'hincapie' },
  { name: 'Cristhian Mosquera',   pos: 'DEF', num: 3,  nat: '🇨🇴', age: 21, photo: 'mosquera' },
  { name: 'Riccardo Calafiori',   pos: 'DEF', num: 33, nat: '🇮🇹', age: 23, photo: 'calafiori' },
  { name: 'Myles Lewis-Skelly',   pos: 'DEF', num: 49, nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 19, photo: 'lewis-skelly' },
  { name: 'Jurriën Timber',       pos: 'DEF', num: 12, nat: '🇳🇱', age: 24, photo: 'timber' },
  { name: 'Ben White',            pos: 'DEF', num: 4,  nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 28, photo: 'white' },
  // Milieux
  { name: 'Martín Zubimendi',     pos: 'MID', num: 36, nat: '🇪🇸', age: 27, photo: 'zubimendi' },
  { name: 'Christian Nørgaard',   pos: 'MID', num: 16, nat: '🇩🇰', age: 32, photo: 'norgaard' },
  { name: 'Declan Rice',          pos: 'MID', num: 41, nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 27, photo: 'rice' },
  { name: 'Mikel Merino',         pos: 'MID', num: 23, nat: '🇪🇸', age: 29, photo: 'merino' },
  { name: 'Martin Ødegaard',      pos: 'MID', num: 8,  nat: '🇳🇴', age: 27, captain: true, photo: 'odegaard' },
  { name: 'Eberechi Eze',         pos: 'MID', num: 10, nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 27, photo: 'eze' },
  // Attaquants
  { name: 'Gabriel Martinelli',   pos: 'ATT', num: 11, nat: '🇧🇷', age: 24, photo: 'martinelli' },
  { name: 'Leandro Trossard',     pos: 'ATT', num: 19, nat: '🇧🇪', age: 31, photo: 'trossard' },
  { name: 'Bukayo Saka',          pos: 'ATT', num: 7,  nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 24, photo: 'saka' },
  { name: 'Noni Madueke',         pos: 'ATT', num: 20, nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 24, photo: 'madueke' },
  { name: 'Viktor Gyökeres',      pos: 'ATT', num: 14, nat: '🇸🇪', age: 27, photo: 'gyokeres' },
  { name: 'Kai Havertz',          pos: 'ATT', num: 29, nat: '🇩🇪', age: 26, photo: 'havertz' },
  { name: 'Gabriel Jesus',        pos: 'ATT', num: 9,  nat: '🇧🇷', age: 29, photo: 'jesus' },
  { name: 'Max Dowman',           pos: 'ATT', num: 56, nat: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', age: 16, photo: 'dowman' },
]

const HISTORY = [
  { year: '1886', title: 'Fondation', desc: 'Arsenal est fondé à Woolwich par des ouvriers de la Royal Arsenal Factory. Le club commence à jouer dans les rues de Londres.', icon: '🏭' },
  { year: '1913', title: 'Déménagement à Highbury', desc: 'Le club déménage au nord de Londres à Highbury, devenant le premier club du nord de la Tamise à intégrer la Football League.', icon: '🏟️' },
  { year: '1930-35', title: 'Ère Herbert Chapman', desc: 'Premier manager à dominé le football anglais. 5 titres de champion en 6 ans. Chapman révolutionne le football avec le système W-M.', icon: '👑' },
  { year: '1970-71', title: 'Premier Double', desc: 'Arsenal remporte le championnat et la FA Cup pour la première fois de son histoire. Une saison légendaire sous Bertie Mee.', icon: '🏆' },
  { year: '1989', title: 'Titre au dernier souffle', desc: 'Arsenal arrache le titre à Anfield lors de la dernière journée avec un but de Michael Thomas à la 91e minute. L\'un des moments les plus dramatiques du football anglais.', icon: '⚡' },
  { year: '1998', title: 'Wenger révolutionne Arsenal', desc: 'Arsène Wenger arrive en 1996 et transforme Arsenal. En 1998, premier Double de l\'ère Wenger avec Overmars, Bergkamp, Petit et Vieira.', icon: '🔴' },
  { year: '2003-04', title: 'Les Invincibles ∞', desc: 'Season 49 matchs sans défaite toutes compétitions confondues. Arsenal finit la Premier League invaincus (26V 12N 0D). Un record qui restera probablement à jamais.', icon: '🛡️' },
  { year: '2014-20', title: 'Rois de la FA Cup', desc: 'Arsenal remporte 3 FA Cups en 4 ans (2014, 2015, 2017, 2020). La FA Cup devient le terrain de chasse favori des Gunners sous Wenger puis Arteta.', icon: '🏅' },
  { year: '2023', title: 'Retour au sommet', desc: 'Mikel Arteta reconstruit Arsenal en puissance. Les Gunners terminent 2e de Premier League, à 2 points du titre. Une nouvelle génération dorée avec Saka, Rice, Ødegaard.', icon: '📈' },
]

const TITLES = [
  { label: 'Titres PL/D1', value: '13', icon: '🏆' },
  { label: 'FA Cups', value: '14', icon: '🥇' },
  { label: 'League Cups', value: '2', icon: '🏅' },
  { label: 'Inter-Cities Fairs Cup', value: '1', icon: '⭐' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const POS_COLOR: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  DEF: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  MID: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  ATT: 'bg-red-500/20 text-red-300 border-red-500/30',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function MatchCard({ match, isArsenal }: { match: Match; isArsenal: (name: string) => boolean }) {
  const home = match.homeTeam
  const away = match.awayTeam
  const score = match.score.fullTime
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const arsenalIsHome = isArsenal(home.name)
  const arsenalWon = isFinished && (
    (arsenalIsHome && (score.home ?? 0) > (score.away ?? 0)) ||
    (!arsenalIsHome && (score.away ?? 0) > (score.home ?? 0))
  )
  const draw = isFinished && score.home === score.away

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      isLive
        ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10'
        : 'border-white/10 bg-white/3 hover:border-white/20'
    }`}>
      {/* Competition + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-gray-500">{match.competition.name}</span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
        ) : isFinished ? (
          <span className={`text-[11px] font-semibold ${arsenalWon ? 'text-emerald-400' : draw ? 'text-amber-400' : 'text-red-400'}`}>
            {arsenalWon ? 'Victoire' : draw ? 'Nul' : 'Défaite'}
          </span>
        ) : (
          <span className="text-[11px] text-gray-500">{formatDate(match.utcDate)}</span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex items-center gap-2">
          <img src={home.crest} alt={home.shortName} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className={`text-sm font-semibold truncate ${isArsenal(home.name) ? 'text-white' : 'text-gray-300'}`}>
            {home.shortName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(isLive || isFinished) ? (
            <span className="text-xl font-black text-white tabular-nums min-w-[60px] text-center">
              {score.home ?? 0} – {score.away ?? 0}
            </span>
          ) : (
            <span className="text-sm text-gray-500 font-medium px-2">vs</span>
          )}
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-semibold truncate text-right ${isArsenal(away.name) ? 'text-white' : 'text-gray-300'}`}>
            {away.shortName}
          </span>
          <img src={away.crest} alt={away.shortName} className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type Tab = 'accueil' | 'calendrier' | 'classement' | 'joueurs' | 'histoire' | 'galerie'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'accueil',    label: 'Accueil',     icon: '🏠' },
  { id: 'calendrier', label: 'Calendrier',  icon: '📅' },
  { id: 'classement', label: 'Classement',  icon: '🏆' },
  { id: 'joueurs',    label: 'Joueurs',     icon: '👥' },
  { id: 'histoire',   label: 'Histoire',    icon: '📖' },
  { id: 'galerie',    label: 'Galerie',     icon: '📸' },
]

export default function ArsenalPage() {
  const [tab, setTab]               = useState<Tab>('accueil')
  const [matches, setMatches]       = useState<Match[]>([])
  const [standings, setStandings]   = useState<StandingRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [apiError, setApiError]     = useState(false)
  const [photos, setPhotos]         = useState<string[]>([])

  const isArsenal = (name: string) => name.toLowerCase().includes('arsenal')

  const fetchData = useCallback(async () => {
    try {
      const [matchRes, standRes] = await Promise.all([
        fetch('/api/arsenal?type=results').then(r => r.json()),
        fetch('/api/arsenal?type=standings').then(r => r.json()),
      ])
      if (matchRes.data?.matches) setMatches(matchRes.data.matches)
      const table = standRes.data?.standings?.[0]?.table ?? []
      setStandings(table)
    } catch {
      setApiError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Fetch upcoming separately
  const [upcoming, setUpcoming] = useState<Match[]>([])
  useEffect(() => {
    fetch('/api/arsenal?type=upcoming')
      .then(r => r.json())
      .then(d => { if (d.data?.matches) setUpcoming(d.data.matches) })
      .catch(() => {})
  }, [])

  // Live match check
  const [liveMatch, setLiveMatch] = useState<Match | null>(null)
  useEffect(() => {
    const check = () => {
      fetch('/api/arsenal?type=live')
        .then(r => r.json())
        .then(d => { setLiveMatch(d.data?.matches?.[0] ?? null) })
        .catch(() => {})
    }
    check()
    const t = setInterval(check, 60_000)
    return () => clearInterval(t)
  }, [])

  const arsenalStanding = standings.find(s => s.team.id === 57)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* HERO */}
      <div className="relative overflow-hidden">
        {/* Background gradient Arsenal red */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#EF0107]/20 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#EF0107]/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Crest area */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-[#EF0107]/10 border-2 border-[#EF0107]/30 flex items-center justify-center text-6xl shadow-2xl shadow-[#EF0107]/20">
                🔴
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF0107]/10 border border-[#EF0107]/30 text-[#EF0107] text-xs mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF0107] animate-pulse" />
                Saison 2024-25 · Premier League
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                Arsenal FC
              </h1>
              <p className="text-[#EF0107] font-bold text-xl mt-1">The Gunners · Fondé en 1886</p>
              <p className="text-gray-400 mt-3 max-w-lg">
                North London is Red. Depuis 1886, Arsenal incarne le football offensif, élégant et ambitieux.
                13 titres de champion, 14 FA Cups et les légendaires Invincibles de 2003-04.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 mt-5 justify-center md:justify-start">
                {arsenalStanding && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Trophy className="w-4 h-4 text-[#EF0107]" />
                    <span className="text-white font-bold">{arsenalStanding.position}e</span>
                    <span className="text-gray-500 text-sm">PL · {arsenalStanding.points} pts</span>
                  </div>
                )}
                {TITLES.map(t => (
                  <div key={t.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span>{t.icon}</span>
                    <span className="text-white font-bold">{t.value}</span>
                    <span className="text-gray-500 text-sm hidden sm:inline">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE MATCH BANNER */}
      {liveMatch && (
        <div className="bg-[#EF0107] px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white font-bold text-sm">MATCH EN DIRECT</span>
            </div>
            <div className="flex items-center gap-4 text-white font-black text-lg">
              <span>{liveMatch.homeTeam.shortName}</span>
              <span>{liveMatch.score.fullTime.home ?? 0} – {liveMatch.score.fullTime.away ?? 0}</span>
              <span>{liveMatch.awayTeam.shortName}</span>
            </div>
            <span className="text-white/70 text-xs">{liveMatch.competition.name}</span>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.id
                    ? 'bg-[#EF0107]/15 text-[#EF0107] border border-[#EF0107]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── ACCUEIL ── */}
        {tab === 'accueil' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Derniers résultats */}
              <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-[#EF0107]" />
                  Derniers résultats
                </h2>
                {loading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
                ) : apiError ? (
                  <div className="rounded-2xl border border-white/10 p-6 text-center text-gray-500">
                    <p>Clé API manquante</p>
                    <p className="text-xs mt-1">Ajoute FOOTBALL_API_KEY dans Vercel</p>
                  </div>
                ) : matches.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun résultat disponible</p>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 5).map(m => <MatchCard key={m.id} match={m} isArsenal={isArsenal} />)}
                  </div>
                )}
              </div>

              {/* Prochains matchs */}
              <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-[#EF0107]" />
                  Prochains matchs
                </h2>
                {upcoming.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 p-6 text-center text-gray-500 text-sm">
                    {apiError ? 'Clé API manquante' : 'Calendrier à venir'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.slice(0, 5).map(m => <MatchCard key={m.id} match={m} isArsenal={isArsenal} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Classement rapide */}
            {arsenalStanding && (
              <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-[#EF0107]" />
                  Position actuelle
                </h2>
                <div className="rounded-2xl border border-[#EF0107]/30 bg-[#EF0107]/5 p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-black text-[#EF0107]">{arsenalStanding.position}e</span>
                      <div>
                        <p className="text-white font-bold text-lg">Arsenal FC</p>
                        <p className="text-gray-400 text-sm">Premier League 2024-25</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-center">
                      {[
                        { label: 'MJ', value: arsenalStanding.playedGames },
                        { label: 'V', value: arsenalStanding.won },
                        { label: 'N', value: arsenalStanding.draw },
                        { label: 'D', value: arsenalStanding.lost },
                        { label: 'DB', value: arsenalStanding.goalDifference },
                        { label: 'PTS', value: arsenalStanding.points },
                      ].map(s => (
                        <div key={s.label}>
                          <p className="text-xs text-gray-500">{s.label}</p>
                          <p className={`font-black text-lg ${s.label === 'PTS' ? 'text-[#EF0107]' : 'text-white'}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Form */}
                  {arsenalStanding.form && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Forme récente</span>
                      <div className="flex gap-1">
                        {arsenalStanding.form.split(',').map((r, i) => (
                          <span key={i} className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            r === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                            r === 'D' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{r === 'W' ? 'V' : r === 'D' ? 'N' : 'D'}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CALENDRIER ── */}
        {tab === 'calendrier' && (
          <div className="space-y-6">
            <h2 className="text-white font-bold text-2xl">Calendrier & Résultats</h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-4">
                {upcoming.length > 0 && (
                  <div>
                    <p className="text-[#EF0107] font-semibold text-sm uppercase tracking-wider mb-3">À venir</p>
                    <div className="space-y-3">
                      {upcoming.map(m => <MatchCard key={m.id} match={m} isArsenal={isArsenal} />)}
                    </div>
                  </div>
                )}
                {matches.length > 0 && (
                  <div>
                    <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider mb-3 mt-6">Résultats récents</p>
                    <div className="space-y-3">
                      {matches.map(m => <MatchCard key={m.id} match={m} isArsenal={isArsenal} />)}
                    </div>
                  </div>
                )}
                {upcoming.length === 0 && matches.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Données indisponibles</p>
                    <p className="text-xs mt-1">Ajoute FOOTBALL_API_KEY dans les variables Vercel</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CLASSEMENT ── */}
        {tab === 'classement' && (
          <div>
            <h2 className="text-white font-bold text-2xl mb-6">Classement Premier League</h2>
            {standings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Classement indisponible</p>
                <p className="text-xs mt-1">Ajoute FOOTBALL_API_KEY dans les variables Vercel</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/8">
                      <th className="px-4 py-3 text-left text-gray-500 font-medium w-8">#</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Équipe</th>
                      <th className="px-2 py-3 text-center text-gray-500 font-medium">MJ</th>
                      <th className="px-2 py-3 text-center text-gray-500 font-medium">V</th>
                      <th className="px-2 py-3 text-center text-gray-500 font-medium">N</th>
                      <th className="px-2 py-3 text-center text-gray-500 font-medium">D</th>
                      <th className="px-2 py-3 text-center text-gray-500 font-medium hidden sm:table-cell">DB</th>
                      <th className="px-4 py-3 text-center text-gray-500 font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => {
                      const isArs = row.team.id === 57
                      return (
                        <tr key={row.team.id} className={`border-b border-white/5 last:border-0 ${isArs ? 'bg-[#EF0107]/8 border-[#EF0107]/20' : 'hover:bg-white/2'}`}>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${isArs ? 'text-[#EF0107]' : row.position <= 4 ? 'text-sky-400' : row.position <= 6 ? 'text-amber-400' : row.position >= 18 ? 'text-red-400' : 'text-gray-500'}`}>
                              {row.position}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={row.team.crest} alt="" className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              <span className={`font-medium ${isArs ? 'text-white' : 'text-gray-300'}`}>{row.team.shortName}</span>
                              {isArs && <span className="text-[10px] bg-[#EF0107]/20 text-[#EF0107] px-1.5 py-0.5 rounded-full border border-[#EF0107]/30">Arsenal</span>}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center text-gray-400">{row.playedGames}</td>
                          <td className="px-2 py-3 text-center text-emerald-400 font-medium">{row.won}</td>
                          <td className="px-2 py-3 text-center text-amber-400">{row.draw}</td>
                          <td className="px-2 py-3 text-center text-red-400">{row.lost}</td>
                          <td className="px-2 py-3 text-center text-gray-400 hidden sm:table-cell">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-black text-base ${isArs ? 'text-[#EF0107]' : 'text-white'}`}>{row.points}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── JOUEURS ── */}
        {tab === 'joueurs' && (
          <div>
            <h2 className="text-white font-bold text-2xl mb-6">Effectif 2024-25</h2>
            {(['GK', 'DEF', 'MID', 'ATT'] as const).map(pos => {
              const posPlayers = PLAYERS.filter(p => p.pos === pos)
              const posLabel = { GK: 'Gardiens', DEF: 'Défenseurs', MID: 'Milieux', ATT: 'Attaquants' }[pos]
              return (
                <div key={pos} className="mb-8">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">{posLabel}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posPlayers.map(p => (
                      <div key={p.name} className="rounded-2xl border border-white/10 bg-white/3 hover:border-[#EF0107]/30 hover:bg-[#EF0107]/5 transition-all p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Photo ou fallback emoji */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-[#EF0107]/10 flex items-center justify-center">
                            <img
                              src={`/arsenal/players/${p.photo}.webp`}
                              alt={p.name}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => {
                                const t = e.target as HTMLImageElement
                                t.style.display = 'none'
                                t.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                            <span className="hidden text-2xl">
                              {pos === 'GK' ? '🧤' : pos === 'DEF' ? '🛡️' : pos === 'MID' ? '⚙️' : '⚡'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black text-[#EF0107]/50">#{p.num}</span>
                            <p className="text-white font-bold leading-tight">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-base">{p.nat}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${POS_COLOR[p.pos]}`}>{p.pos}</span>
                              {p.captain && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">C</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-center border-t border-white/5 pt-3">
                          <div>
                            <p className="text-[11px] text-gray-500">Âge</p>
                            <p className="text-white font-bold">{p.age} ans</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500">Numéro</p>
                            <p className="text-[#EF0107] font-bold">#{p.num}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── HISTOIRE ── */}
        {tab === 'histoire' && (
          <div>
            <h2 className="text-white font-bold text-2xl mb-2">L&apos;Histoire des Gunners</h2>
            <p className="text-gray-500 mb-8">138 ans de football, de passion et de gloire depuis Woolwich jusqu&apos;à l&apos;Emirates.</p>

            {/* Palmarès */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {TITLES.map(t => (
                <div key={t.label} className="rounded-2xl border border-[#EF0107]/20 bg-[#EF0107]/5 p-5 text-center">
                  <span className="text-3xl">{t.icon}</span>
                  <p className="text-3xl font-black text-[#EF0107] mt-2">{t.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{t.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#EF0107]/20" />
              <div className="space-y-8">
                {HISTORY.map((h, i) => (
                  <div key={i} className="relative pl-16">
                    <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full bg-[#EF0107] border-4 border-[#0a0a0a] flex items-center justify-center text-xs">
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/3 hover:border-[#EF0107]/30 transition-all p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{h.icon}</span>
                        <div>
                          <span className="text-[#EF0107] font-black text-sm">{h.year}</span>
                          <h3 className="text-white font-bold text-lg leading-tight">{h.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Légendes */}
            <div className="mt-10">
              <h3 className="text-white font-bold text-xl mb-5">Légendes du Club</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Thierry Henry', role: 'Attaquant · 1999-2007', goals: '228 buts', flag: '🇫🇷', desc: 'Meilleur buteur all-time d\'Arsenal. Dieu à Highbury puis à l\'Emirates.' },
                  { name: 'Dennis Bergkamp', role: 'Attaquant · 1995-2006', goals: '120 buts', flag: '🇳🇱', desc: 'Le Non-Flying Dutchman. Technicien hors du commun, auteur de buts légendaires.' },
                  { name: 'Patrick Vieira', role: 'Milieu · 1996-2005', goals: 'Capitaine', flag: '🇫🇷', desc: 'Leader incontesté des Invincibles. La référence au milieu de terrain des années 2000.' },
                  { name: 'Ian Wright', role: 'Attaquant · 1991-1998', goals: '185 buts', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', desc: 'L\'idole de Highbury. Record de buts tenu pendant 10 ans avant Henry.' },
                  { name: 'Robert Pires', role: 'Milieu · 2000-2006', goals: '84 buts', flag: '🇫🇷', desc: 'Ailier de génie des Invincibles. Meilleur joueur PL 2002. Élégance incarnée.' },
                  { name: 'Tony Adams', role: 'Défenseur · 1983-2002', goals: 'Capitaine', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', desc: 'Mr Arsenal. Défenseur légendaire, capitaine pendant 14 ans, 4 titres.' },
                ].map(leg => (
                  <div key={leg.name} className="rounded-2xl border border-white/10 bg-white/3 p-5 hover:border-[#EF0107]/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[#EF0107]/10 border border-[#EF0107]/20 flex items-center justify-center text-2xl">
                        {leg.flag}
                      </div>
                      <div>
                        <p className="text-white font-bold">{leg.name}</p>
                        <p className="text-[#EF0107] text-xs">{leg.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{leg.desc}</p>
                    <div className="mt-3 inline-block px-2.5 py-1 rounded-full bg-[#EF0107]/10 text-[#EF0107] text-xs border border-[#EF0107]/20 font-semibold">
                      {leg.goals}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GALERIE ── */}
        {tab === 'galerie' && (
          <div>
            <h2 className="text-white font-bold text-2xl mb-2">Galerie Photos</h2>
            <p className="text-gray-500 mb-8">Tes photos Arsenal — dépose tes images dans <code className="text-[#EF0107] bg-[#EF0107]/10 px-1.5 py-0.5 rounded text-xs">public/arsenal/</code> pour les voir apparaître ici.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Placeholder cards */}
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-[#EF0107]/20 bg-[#EF0107]/3 flex flex-col items-center justify-center gap-2 hover:border-[#EF0107]/40 transition-colors">
                  <span className="text-3xl opacity-30">📸</span>
                  <p className="text-gray-600 text-xs">Photo {i}</p>
                  <p className="text-gray-700 text-[10px]">public/arsenal/photo{i}.jpg</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-6">
              <h3 className="text-white font-semibold mb-3">📁 Comment ajouter des photos</h3>
              <ol className="space-y-2 text-gray-400 text-sm">
                <li>1. Dépose tes images dans le dossier <code className="text-[#EF0107]">public/arsenal/</code></li>
                <li>2. Nomme-les <code className="text-[#EF0107]">photo1.jpg</code>, <code className="text-[#EF0107]">photo2.jpg</code>, etc.</li>
                <li>3. Push sur GitHub — les photos s&apos;afficheront automatiquement</li>
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
