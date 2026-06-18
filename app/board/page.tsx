import BoardView from "@/components/views/BoardView";

// Public graffiti wall — no login; anyone can read + write.
export default function BoardPage() {
  return <BoardView mode="user" />;
}
