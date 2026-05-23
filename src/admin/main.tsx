import { createRoot } from 'react-dom/client';
import App from './App';

export function mount(el: HTMLElement) {
  const root = createRoot(el);
  root.render(<App />);
}

const rootEl = document.getElementById('admin-root');
if (rootEl) {
  mount(rootEl);
}
