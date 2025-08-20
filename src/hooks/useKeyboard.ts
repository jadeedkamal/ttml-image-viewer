import { useEffect } from 'react';

export function useKeyboard(
  handlers: Record<string, (e: KeyboardEvent) => void>,
  deps: any[] = []
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = handlers[e.key];
      if (handler) {
        handler(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, deps);
}


