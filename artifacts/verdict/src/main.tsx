import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_cGVyZmVjdC1rb2RpYWstNDIwLmNsZXJrLmFjY291bnRzLmRldiQ';

function MissingKeyFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#11141c] text-white p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-bold">Clerk Publishable Key Required</h1>
        <p className="text-sm text-neutral-400">
          Please add <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-amber-300">VITE_CLERK_PUBLISHABLE_KEY</code> to your Vercel Project Environment Variables and redeploy.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    {clerkPubKey ? (
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    ) : (
      <MissingKeyFallback />
    )}
  </ErrorBoundary>,
);
