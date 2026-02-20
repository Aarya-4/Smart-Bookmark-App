import { createClient } from "../lib/supabase/server";
import BookmarkManager from "../components/bookmarkmanager";
import LogoutButton from "../components/logout";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <LogoutButton />
      </div>

      <BookmarkManager
        initialBookmarks={bookmarks || []}
        userId={session.user.id}
      />
    </div>
  );
}