"use client"
import { createClient } from '../lib/supabase/server'
import { redirect } from 'next/navigation'
import BookmarkManager from '../components/bookmarkmanager'
import LogoutButton from '../components/logout'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">📌 My Bookmarks</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <BookmarkManager initialBookmarks={bookmarks || []} userId={user.id} />
      </div>
    </main>
  )
}