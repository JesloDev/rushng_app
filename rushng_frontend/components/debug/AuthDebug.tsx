'use client';

import { useAuth } from '@/hooks/useAuth';

export function AuthDebug() {
  const { user, isAuthenticated, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-black/90 text-white text-xs rounded-lg max-w-md overflow-auto max-h-48">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {String(loading)}</div>
      <div>Auth: {String(isAuthenticated)}</div>
      <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
    </div>
  );
}