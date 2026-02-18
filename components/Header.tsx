'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bookmark, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google'
  })
}

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    // FIX: Use window.location for a clean state reset
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-6">

        {/* Logo Section */}
        <div 
          // FIX: Changed from router.push to window.location to prevent "half-content" render issues
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Bookmark size={20} className="text-white fill-white/20" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Smart<span className="text-blue-500">Keeper</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-6">
          {user ? (
            <>
              {pathname !== '/dashboard' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
              )}

              <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-semibold"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="group flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full hover:bg-slate-200 transition-all font-bold text-sm shadow-lg shadow-white/5"
            >
              <ShieldCheck size={16} className="text-blue-600" />
              Sign in with Google
            </button>
          )}
        </div>

      </div>
    </header>
  )
}