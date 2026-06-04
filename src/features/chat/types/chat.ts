export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "partner";
  time: string;
}
