'use client';

import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export function ConnectionStatus() {
  const { isOnline, isServerAvailable } = useConnectionStatus();

  if (isOnline && isServerAvailable) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-white z-50">
      {!isOnline && (
        <div className="text-red-600 mb-2">
          <span className="font-bold">⚠️ Network Offline</span>
          <p className="text-sm">Changes will be saved locally and synced when back online</p>
        </div>
      )}
      {isOnline && !isServerAvailable && (
        <div className="text-orange-600">
          <span className="font-bold">⚠️ Server Unavailable</span>
          <p className="text-sm">Changes will be saved locally and synced when server is back</p>
        </div>
      )}
    </div>
  );
} 