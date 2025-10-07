// src/globals.d.ts
interface Window {
  gtag: {
    (command: 'config', targetId: string, config?: Record<string, any>): void;
    (command: 'event', eventName: string, params?: Record<string, any>): void;
    (command: 'js', date: Date): void;
  };
}

// Declare gtag function for use outside the window context if needed
declare var gtag: Window['gtag'];