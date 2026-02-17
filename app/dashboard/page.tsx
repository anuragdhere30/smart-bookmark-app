'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, MousePointer2 } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // 1. Move fetchBookmarks to the top to fix the "Used before declaration" error
  const fetchBookmarks = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setBookmarks(data || [])
  }, [])

  // 2. Single Unified Effect for Auth and Real-time
  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      
      setUserId(user.id)
      await fetchBookmarks(user.id)
      setLoading(false)

      // CRITICAL: This is the ONLY place where the UI list updates.
      // This ensures Tab A and Tab B stay in sync instantly.
      channel = supabase
        .channel(`user-bookmarks-${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookmarks', 
          filter: `user_id=eq.${user.id}` 
        }, (payload) => {
          console.log('Real-time change detected:', payload)
          fetchBookmarks(user.id)
        })
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [router, fetchBookmarks])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !userId) return;

    const currentTitle = title;
    const currentUrl = url;
    
    // Clear inputs immediately for "snappy" feeling
    setTitle('');
    setUrl('');

    // Insert only. The Real-time listener handles the state update to avoid duplicates.
    const { error } = await supabase
      .from('bookmarks')
      .insert([{ title: currentTitle, url: currentUrl, user_id: userId }])

    if (error) {
      alert("Error saving bookmark");
      setTitle(currentTitle);
      setUrl(currentUrl);
    }
  };

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Could not delete bookmark')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white"
          >
            Smart <span className="text-blue-500">Vault</span>
          </motion.h1>
          <p className="text-slate-400 mt-2">
            Real-time Library: {bookmarks.length} links
          </p>
        </div>

        {/* FORM */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addBookmark}
          className="bg-slate-900/50 border border-white/10 p-3 rounded-2xl mb-14 flex flex-col md:flex-row gap-3 shadow-xl"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Website Title"
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
            required
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            type="url"
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} /> Save
          </button>
        </motion.form>

        {/* BOOKMARK GRID */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {bookmarks.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group bg-slate-900/60 border border-white/10 p-6 rounded-2xl hover:border-blue-500/40 transition-all shadow-lg"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <MousePointer2 size={18} className="text-blue-400" />
                    </div>
                    <button
                      onClick={() => deleteBookmark(b.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-white truncate mb-2">
                    {b.title}
                  </h3>

                  <div className="mt-auto">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-xs truncate hover:underline flex items-center gap-1 w-fit"
                    >
                      {b.url} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {bookmarks.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl"
          >
            <p className="text-slate-500 italic">No bookmarks yet. Add your first link above!</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}