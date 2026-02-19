'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

type Bookmark = {
  id: string
  url: string
  title: string
  created_at: string
}

export default function BookmarkManager({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[]
  userId: string
}) {
  const supabase = createClient()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !title) return
    setLoading(true)

    const { error } = await supabase.from('bookmarks').insert({
      url,
      title,
      user_id: userId,
    })

    if (!error) {
      setUrl('')
      setTitle('')
    }
    setLoading(false)
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  return (
    <div>
      {/* Add Form */}
      <form onSubmit={addBookmark} className="bg-white p-6 rounded-xl shadow-sm mb-6 space-y-3">
        <h2 className="font-semibold text-gray-700">Add Bookmark</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Adding...' : '+ Add Bookmark'}
        </button>
      </form>

      {/* Bookmark List */}
      <div className="space-y-3">
        {bookmarks.length === 0 && (
          <p className="text-center text-gray-400 py-10">No bookmarks yet. Add one above!</p>
        )}
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{bookmark.title}</p>
            
               {/* ✅ was missing <a */}
              <a 
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline truncate max-w-xs block"
              >
                {bookmark.url}
              </a>
            </div>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-400 hover:text-red-600 text-sm font-medium ml-4"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}