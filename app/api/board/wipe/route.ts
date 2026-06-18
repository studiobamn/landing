import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Wipe / Reset — restore_point → data. Snaps back to the last committed
// checkpoint. If there's no restore_point: "There is no point of return".
export async function POST() {
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

  const { data: row, error: readErr } = await supabase
    .from("board")
    .select("restore_point")
    .eq("name", "live")
    .maybeSingle();
  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }
  if (!row?.restore_point) {
    return NextResponse.json(
      { error: "There is no point of return" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("board")
    .update({ data: row.restore_point, updated_at: new Date().toISOString() })
    .eq("name", "live");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
