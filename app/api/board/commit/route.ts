import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Save / Commit — "Set as restore point". Writes the current snapshot into BOTH
// data AND restore_point. Commit is the ONLY writer of restore_point.
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const snapshot = body.snapshot ?? null;

  const { error } = await supabase
    .from("board")
    .update({
      data: snapshot,
      restore_point: snapshot,
      updated_at: new Date().toISOString(),
    })
    .eq("name", "live");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
