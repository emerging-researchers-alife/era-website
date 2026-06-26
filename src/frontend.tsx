/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { Suspense } from 'react';
import { router } from './router';
import './index.css';

function Loading() {
  // Minimal skeleton that matches the page structure to prevent layout shift
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface, #FAFBFC)' }}>
      {/* Header placeholder - matches 72px height */}
      <div className="h-[72px]" />
      {/* Content area - same background, no spinner to avoid flash */}
    </div>
  );
}

function start() {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
