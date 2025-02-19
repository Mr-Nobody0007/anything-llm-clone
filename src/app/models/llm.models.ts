// src/app/models/llm.models.ts

export interface Message {
    id: string;        // Unique message ID
    traceId: string;   // Unique trace ID for this action
    content: string;
    role: 'user' | 'assistant';
    // You can add other fields like timestamps, etc.
  }
  
  export interface Thread {
    id: string;
    name: string;
    messages: Message[];
  }
  
  export interface Workspace {
    id: string;
    name: string;
    threads: Thread[];
  }
  