import { createClient } from "@/lib/supabase/server";
import ChatPageClient from "./chat-client";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: { role: "user" | "assistant"; content: string }[] = [];

  if (user) {
    const { data: rows } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(80);

    initial =
      rows?.map((r) => ({
        role: r.role as "user" | "assistant",
        content: r.content,
      })) ?? [];
  }

  return <ChatPageClient initialMessages={initial} />;
}
