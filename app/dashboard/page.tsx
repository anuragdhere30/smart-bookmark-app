'use client'

import { useEffect, useState } from 'react'
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

  // 🔥 INIT + REALTIME
  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setBookmarks(data || [])
      setLoading(false)

      // REALTIME: Direct state updates (no refetch)
      channel = supabase
        .channel(`bookmarks-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {

            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => {
                // prevent duplicate if optimistic already added
                if (prev.some((b) => b.id === payload.new.id)) return prev
                return [payload.new, ...prev]
              })
            }

            if (payload.eventType === 'DELETE') {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id)
              )
            }

            if (payload.eventType === 'UPDATE') {
              setBookmarks((prev) =>
                prev.map((b) =>
                  b.id === payload.new.id ? payload.new : b
                )
              )
            }
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [router])

  // ➕ ADD (Optimistic + Simple)
const addBookmark = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!title.trim() || !url.trim() || !userId) {
    console.error("Missing fields or User ID");
    return;
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ title, url, user_id: userId }])
    .select(); // Returns the inserted row to confirm success

  if (error) {
    console.error('Supabase Insert Error:', error.message, error.details);
    alert(`Save failed: ${error.message}`);
  } else {
    console.log('Successfully saved:', data);
    setTitle('');
    setUrl('');
  }
};

  // ❌ DELETE (Optimistic + Simple)
  const deleteBookmark = async (id: string) => {
    const previous = bookmarks

    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      setBookmarks(previous)
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
          <h1 className="text-4xl font-bold text-white">
            Smart <span className="text-blue-500">Vault</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time Library: {bookmarks.length} links
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={addBookmark}
          className="bg-slate-900/50 border border-white/10 p-3 rounded-2xl mb-14 flex flex-col md:flex-row gap-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
            required
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            type="url"
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition"
          >
            <Plus size={18} /> Save
          </button>
        </form>

        {/* BOOKMARK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {bookmarks.map((b) => (
    <motion.div
      key={b.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="group bg-slate-900/60 border border-white/10 p-6 rounded-2xl hover:border-blue-500/40 transition"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <MousePointer2 size={18} className="text-blue-400" />
          <button
            onClick={() => deleteBookmark(b.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <h3 className="font-semibold text-white truncate mb-2">
          {b.title}
        </h3>

        <a
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-xs truncate hover:underline flex items-center gap-1"
        >
          {b.url} <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  ))}
</div>

      </div>
    </div>
  )
}