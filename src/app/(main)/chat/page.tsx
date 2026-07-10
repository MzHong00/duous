import type { Metadata } from "next";
import { ChatView } from "@/features/chat/components/ChatView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.CHAT };

export default function Page() {
  return <ChatView />;
}
