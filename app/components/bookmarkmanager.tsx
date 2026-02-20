"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
  user_id: string;
};

export default function BookmarkManager({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const supabase = createClient();

  // ✅ Make sure state is only initialized on client
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  /* ================= REALTIME ================= */
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => {
              const exists = prev.find((b) => b.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as Bookmark, ...prev];
            });
          }

          if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === payload.new.id ? (payload.new as Bookmark) : b
              )
            );
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("bookmarks")
        .update({ title, url })
        .eq("id", editingId);

      if (error) alert(error.message);
      else setEditingId(null);
    } else {
      const { error } = await supabase.from("bookmarks").insert({
        title,
        url,
        user_id: userId,
      });

      if (error) alert(error.message);
    }

    setTitle("");
    setUrl("");
    setLoading(false);
  };

  /* ================= DELETE ================= */
  const deleteBookmark = async (id: string) => {
    const previous = bookmarks;

    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      alert(error.message);
      setBookmarks(previous);
    }
  };

  const startEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto space-y-12 pt-20">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border-b border-gray-300 bg-transparent px-2 py-3 text-sm focus:outline-none focus:border-black transition"
          required
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border-b border-gray-300 bg-transparent px-2 py-3 text-sm focus:outline-none focus:border-black transition"
          required
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300 }}
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm bg-black text-white rounded-full disabled:opacity-50"
        >
          {editingId ? "Update" : "Add"}
        </motion.button>
      </form>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-gray-400 uppercase tracking-wider text-xs border-b">
            <tr>
              <th className="text-left px-6 py-4">Title</th>
              <th className="text-left px-6 py-4">Link</th>
              <th className="text-right px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {bookmarks.map((bookmark) => (
                <motion.tr
                  key={bookmark.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{bookmark.title}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
                      {bookmark.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      onClick={() => startEdit(bookmark)}
                      className="text-gray-400 hover:text-black transition"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      Delete
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {bookmarks.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-400">
                  No bookmarks yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}