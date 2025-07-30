/// <reference types="vite/client" />

declare global {
  interface Window {
    Churnaizer?: {
      track: (userData: any, apiKey: string, callback: (error: any, result: any) => void) => void;
    };
  }
}
