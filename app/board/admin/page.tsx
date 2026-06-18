import { redirect } from "next/navigation";
import BoardView from "@/components/views/BoardView";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Admin board — requires a Supabase Auth session (admins created in the
// dashboard; no signup). Unauthenticated → login.
export default async function AdminBoardPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/board");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/board/admin/login");

  return <BoardView mode="admin" />;
}
