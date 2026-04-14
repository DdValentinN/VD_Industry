import { Sidebar } from '@/components/app/Sidebar'
import { AuthProvider } from '@/context/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <Sidebar />
        <main className="flex-1 min-w-0 lg:overflow-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
