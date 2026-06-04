"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { ProfileImage } from "@/shared/components/ProfileImage";
import { formatChatTime } from "@/shared/utils/date";
import type { ChatMessage } from "@/features/chat/types/chat";
import styles from "./ChatView.module.scss";

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", text: "오늘 저녁에 뭐 먹을까?", sender: "partner", time: "오후 2:30" },
  { id: "2", text: "음 글쎄", sender: "me", time: "오후 2:31" },
  { id: "3", text: "파스타 어때? 저번에 가보고 싶다던 곳!", sender: "me", time: "오후 2:32" },
  { id: "4", text: "좋아! 7시에 역 앞에서 만나", sender: "partner", time: "오후 2:33" },
];

export const ChatView = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const partner = currentWorkspace?.members?.find((m) => m.id !== "user-1") ?? {
    id: "partner",
    name: "파트너",
    avatar: undefined,
    email: "",
  };

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !pageRef.current) return;

    const update = () => {
      if (!pageRef.current) return;
      pageRef.current.style.height = `${vv.height}px`;
      pageRef.current.style.top = `${vv.offsetTop}px`;
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      time: formatChatTime(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ChevronLeft size={24} />
        </button>
        <div className={styles.headerInfo}>
          <ProfileImage uri={partner.avatar} name={partner.name} size={36} />
          <div>
            <p className={styles.partnerName}>{partner.name}</p>
            <p className={styles.onlineStatus}>현재 활동 중</p>
          </div>
        </div>
        <div className={styles.headerRight} />
      </header>

      <div className={styles.messages}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            sender={msg.sender}
            time={msg.time}
            avatar={msg.sender === "partner" ? partner.avatar : undefined}
            name={msg.sender === "partner" ? partner.name : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <ChatInput value={inputText} onChange={setInputText} onSend={sendMessage} />
      </div>
    </div>
  );
};
