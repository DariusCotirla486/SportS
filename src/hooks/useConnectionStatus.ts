'use client';

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
      // If we're offline, don't even try to check server status
      if (!navigator.onLine) {
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          isServerAvailable: false
        }));
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
          // Add cache: 'no-store' to prevent caching of the health check
          cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn('Server health check failed:', response.status);
          setStatus(prev => ({
            ...prev,
            isServerAvailable: false
          }));
          return;
        }

        const data = await response.json();
        setStatus(prev => ({
          ...prev,
          isOnline: true,
          isServerAvailable: data.status === 'ok'
        }));
      } catch (error) {
        // Handle network errors and server unavailability
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          console.warn('Server is unavailable');
        } else {
          console.warn('Server health check error:', error);
        }
        
        setStatus(prev => ({
          ...prev,
          isServerAvailable: false
        }));
      }
    };

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      // Check server status when coming back online
      checkServerStatus();
    };

    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false,
        isServerAvailable: false // Server is considered unavailable when offline
      }));
    };

    // Initial check
    checkServerStatus();

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic server check
    const interval = setInterval(checkServerStatus, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return status;
} 