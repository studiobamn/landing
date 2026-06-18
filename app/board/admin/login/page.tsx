"use client";

// Admin login — login only, no signup (admins created in the Supabase
// dashboard). Uses the cookie-based browser client so the server routes can
// read the session.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Auth is not configured.");
      return;
    }
    const data = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/board/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="font-secondary flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="font-primary text-2xl font-bold text-bamn-black">
          Board admin
        </h1>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
        />
        {error && <p className="text-xs text-bamn-red">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer border border-bamn-black px-4 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
