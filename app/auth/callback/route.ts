import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // ✅ Fix: Proper cookie options for localhost + production
          response.cookies.set({
            name,
            value,
            path: "/", // must be "/" to work on all pages
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production", // only true in prod
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: "",
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            ...options,
          });
        },
      },
    }
  );

  // Exchange the OAuth code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase OAuth error:", error.message);
    return NextResponse.redirect(new URL("/error", request.url));
  }

  console.log("Session created:", data.session);

  return response; // redirect to dashboard with session cookie set
}