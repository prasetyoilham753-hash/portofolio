// Single Page Apps for GitHub Pages: URL query decoder fallback
// Runs immediately on bundle execution before React Router mounts, eliminating inline scripts in HTML
(function(l) {
  if (l.search[1] === '/') {
    const decoded = l.search.slice(1).split('&').map(function(s) { 
      return s.replace(/~and~/g, '&');
    }).join('?');
    window.history.replaceState(null, null,
      l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
}(window.location));

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

