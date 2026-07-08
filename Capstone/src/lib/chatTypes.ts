// Chat message types for the workspace interface

export type MessageRole = "user" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string; // Markdown supported for agent messages
  timestamp: string;
  isStreaming?: boolean; // for typing indicator
}

let msgCounter = 0;
export function createMessage(role: MessageRole, content: string): ChatMessage {
  return {
    id: `msg_${++msgCounter}_${Date.now()}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}
