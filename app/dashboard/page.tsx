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
        <div className="p-8 bg-linear-to-r from-gray-100 to-gray-300 min-h-screen">
          <div className="flex justify-between">
            <h1 className="font-semibold text-3xl font-sans">My Bookmarks</h1>
            <LogoutButton />
          </div>

          <BookmarkManager
            initialBookmarks={bookmarks || []}
            userId={session.user.id}
          />
        </div>
      );
    }