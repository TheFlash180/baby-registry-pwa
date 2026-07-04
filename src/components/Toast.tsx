import { useCallback, useState } from 'react';

export interface ToastMsg {
  id: number;
  text: string;
  warn?: boolean;
}

let nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const push = useCallback((text: string, warn = false) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, text, warn }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return { toasts, push };
}

export function Toasts({ toasts }: { toasts: ToastMsg[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.warn ? ' warn' : ''}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
