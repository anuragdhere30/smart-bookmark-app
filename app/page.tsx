'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Lock, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])
  
const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google'
  })
}

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  }

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Background Mesh/Grid */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm mb-6"
        >
          <Zap size={14} /> <span>Now with Real-time Syncing</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl md:text-7xl font-extrabold mb-8 tracking-tighter leading-none"
        >
          Your Digital Library <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Intelligently Organized
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Smart Keeper is the modern bookmark manager built for speed. 
          Save, manage, and sync your links in real-time across all your devices.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          {!user ? (
            <button
              onClick={handleLogin}
              className="group bg-white text-black px-8 py-4 rounded-full hover:bg-slate-200 transition-all text-lg font-bold flex items-center gap-2 shadow-xl shadow-white/10"
            >
              Get Started for Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-500 transition-all text-lg font-bold shadow-lg shadow-blue-500/20"
            >
              Go to Dashboard
            </button>
          )}
        </motion.div>

        {/* Professional Feature Section */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mt-32 text-left"
        >
          <motion.div variants={itemVars} className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Google OAuth 2.0</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enterprise-grade security. Use your Google account for a passwordless, secure experience.
            </p>
          </motion.div>

          <motion.div variants={itemVars} className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 mb-4">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Privacy First</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Row-Level Security (RLS) ensures that only you can access your saved content. No leaks, ever.
            </p>
          </motion.div>

          <motion.div variants={itemVars} className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-time Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Supabase Realtime. Your dashboard stays in sync instantly across every tab and device.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}