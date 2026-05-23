import { useEffect, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error';
}

let toastApi: ((text: string, type?: ToastItem['type']) => void) | null = null;

export function toast(text: string, type: ToastItem['type'] = 'info') {
  if (toastApi) toastApi(text, type);
}

export default function ToastStack() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((text: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setItems(arr => [...arr, { id, text, type }]);
    setTimeout(() => setItems(arr => arr.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    toastApi = push;
    return () => { toastApi = null; };
  }, [push]);

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>
      ))}
    </div>
  );
}
