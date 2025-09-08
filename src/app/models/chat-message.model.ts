export interface ChatMessage {
  type: MessageType;
  content: string;
  sender: string;
  timestamp?: string;
}

export enum MessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE'
}
