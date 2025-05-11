import { useState, useEffect } from 'react';

interface ConnectionStatus {
  isOnline: boolean;
  isServerAvailable: boolean;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServerAvailable: true,
  });

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        setStatus(prev => ({
          ...prev,
          isServerAvailable: response.ok
        }));
      } catch {
        setStatus(prev => ({
          ...prev,
          isServerAvailable: false
        }));
      }
    };

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkServerStatus();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    // Initial check
    checkServerStatus();

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic server check
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return status;
} 