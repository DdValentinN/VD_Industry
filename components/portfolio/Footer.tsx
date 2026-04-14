import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <span className="text-emerald-400 font-black text-xs">VD</span>
          </div>
          <span className="text-gray-500 text-sm">Valentin Delattre</span>
        </div>
        <p className="text-gray-700 text-xs">
          © {new Date().getFullYear()} · Fait avec Next.js, Prisma &amp; Tailwind
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-700">
          <Link href="/" className="hover:text-gray-400 transition-colors">Portfolio</Link>
          <Link href="/applications" className="hover:text-gray-400 transition-colors">Applications</Link>
          <a href="mailto:delattre.v@outlook.fr" className="hover:text-gray-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
