// types/openai.d.ts

declare global {
    interface ChatCompletionRequestMessage {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }
  }
  
  export {}; // This is needed to make the file a module and avoid issues
  