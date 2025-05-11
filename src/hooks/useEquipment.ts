import { useState, useEffect } from 'react';
import { SportEquipment } from '@/lib/db';
import { offlineService } from '@/services/offlineService';
import { useConnectionStatus } from './useConnectionStatus';

export function useEquipment() {
  const [equipment, setEquipment] = useState<SportEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline, isServerAvailable } = useConnectionStatus();

  // Check if we're offline
  const isOffline = typeof window !== 'undefined' && (!navigator.onLine || !isOnline || !isServerAvailable);

  // Load equipment data
  const loadEquipment = async (skipCache = false) => {
    // If offline or syncing, use cached data
    if (isOffline || isSyncing) {
      const cachedData = offlineService.getEquipment();
      setEquipment(cachedData);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/equipment', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch equipment');
      
      const data = await response.json();
      setEquipment(data);
      offlineService.storeEquipment(data);
    } catch (error) {
      // If fetch fails, use cached data
      const cachedData = offlineService.getEquipment();
      setEquipment(cachedData);
    } finally {
      setLoading(false);
    }
  };

  // Sync pending operations when coming back online
  const syncPendingOperations = async () => {
    if (isOffline || isSyncing) return;

    const pendingOps = offlineService.getPendingOperations();
    if (pendingOps.length === 0) return;

    setIsSyncing(true);
    try {
      // Get current server state first
      const response = await fetch('/api/equipment', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch equipment during sync');
      
      const serverData = await response.json();
      const serverIds = new Set(serverData.map((item: SportEquipment) => item.id));

      // Track items that were created offline and then deleted
      const offlineCreatedIds = new Set<string>();
      const offlineDeletedIds = new Set<string>();

      // First pass: identify offline-created and deleted items
      for (const op of pendingOps) {
        if (op.type === 'CREATE' && op.data.id?.startsWith('temp_')) {
          offlineCreatedIds.add(op.data.id);
        }
        if (op.type === 'DELETE') {
          offlineDeletedIds.add(op.data.id);
        }
      }

      // Keep track of items we've processed to avoid duplicates
      const processedItems = new Set<string>();

      // Process operations in order
      for (const op of pendingOps) {
        switch (op.type) {
          case 'CREATE': {
            // Skip if item was created offline and then deleted
            if (offlineCreatedIds.has(op.data.id) && offlineDeletedIds.has(op.data.id)) {
              continue;
            }

            // Create a unique key for this item based on its properties
            const itemKey = `${op.data.name}-${op.data.category}-${op.data.price}`;
            
            // Skip if we've already processed this item
            if (processedItems.has(itemKey)) {
              continue;
            }
            
            // Skip if item already exists on server
            const existsOnServer = serverData.some(
              (item: SportEquipment) => 
                item.name === op.data.name && 
                item.category === op.data.category &&
                item.price === op.data.price
            );
            if (existsOnServer) {
              processedItems.add(itemKey);
              continue;
            }
            
            const response = await fetch('/api/equipment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(op.data)
            });
            
            if (!response.ok) throw new Error('Failed to sync CREATE operation');
            const newItem = await response.json();
            serverIds.add(newItem.id);
            processedItems.add(itemKey);
            break;
          }

          case 'UPDATE': {
            // Skip if item was created offline and then deleted
            if (offlineCreatedIds.has(op.data.id) && offlineDeletedIds.has(op.data.id)) {
              continue;
            }

            // Skip if item doesn't exist on server
            if (!serverIds.has(op.data.id)) continue;

            const response = await fetch(`/api/equipment?id=${op.data.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(op.data)
            });
            
            if (!response.ok) throw new Error('Failed to sync UPDATE operation');
            break;
          }

          case 'DELETE': {
            // Skip if item was created offline and then deleted
            if (offlineCreatedIds.has(op.data.id) && offlineDeletedIds.has(op.data.id)) {
              continue;
            }

            // Skip if item doesn't exist on server
            if (!serverIds.has(op.data.id)) continue;

            const response = await fetch(`/api/equipment?id=${op.data.id}`, {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
              }
            });
            
            if (!response.ok) {
              // If item not found, it might have been deleted already
              if (response.status === 404) continue;
              throw new Error('Failed to sync DELETE operation');
            }
            
            serverIds.delete(op.data.id);
            break;
          }
        }
      }

      // Clear pending operations after successful sync
      offlineService.clearPendingOperations();
      
      // Get final server state
      const finalResponse = await fetch('/api/equipment', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!finalResponse.ok) throw new Error('Failed to fetch final equipment state');
      
      const finalData = await finalResponse.json();
      
      // Remove any potential duplicates from the final state
      const uniqueItems = finalData.reduce((acc: SportEquipment[], item: SportEquipment) => {
        const itemKey = `${item.name}-${item.category}-${item.price}`;
        if (!acc.some(existing => 
          existing.name === item.name && 
          existing.category === item.category && 
          existing.price === item.price
        )) {
          acc.push(item);
        }
        return acc;
      }, []);

      setEquipment(uniqueItems);
      offlineService.storeEquipment(uniqueItems);
    } catch (error) {
      console.error('Error syncing pending operations:', error);
      setError('Failed to sync offline changes');
    } finally {
      setIsSyncing(false);
    }
  };

  // Effect to sync when coming back online
  useEffect(() => {
    if (!isOffline && !isSyncing) {
      syncPendingOperations();
    }
  }, [isOffline]);

  // Initial load
  useEffect(() => {
    loadEquipment();
  }, []);

  // Add new equipment
  const addEquipment = async (newEquipment: Omit<SportEquipment, 'id'>) => {
    // If offline, handle locally
    if (isOffline) {
      const tempId = `temp_${Date.now()}`;
      const tempEquipment = { ...newEquipment, id: tempId };
      
      // Store in offline storage
      offlineService.addPendingOperation({
        type: 'CREATE',
        data: tempEquipment, // Store the temp equipment with its ID
        timestamp: Date.now()
      });
      
      // Update local state and cache
      const updatedEquipment = [...equipment, tempEquipment];
      setEquipment(updatedEquipment);
      offlineService.storeEquipment(updatedEquipment);
      
      return tempEquipment;
    }

    // If online, try API call
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newEquipment)
      });
      
      if (!response.ok) throw new Error('Failed to add equipment');
      
      const data = await response.json();
      const updatedEquipment = [...equipment, data];
      setEquipment(updatedEquipment);
      offlineService.storeEquipment(updatedEquipment);
      return data;
    } catch (error) {
      // If API call fails, handle as offline
      const tempId = `temp_${Date.now()}`;
      const tempEquipment = { ...newEquipment, id: tempId };
      
      offlineService.addPendingOperation({
        type: 'CREATE',
        data: tempEquipment, // Store the temp equipment with its ID
        timestamp: Date.now()
      });
      
      const updatedEquipment = [...equipment, tempEquipment];
      setEquipment(updatedEquipment);
      offlineService.storeEquipment(updatedEquipment);
      
      return tempEquipment;
    }
  };

  // Update equipment
  const updateEquipment = async (id: string, updates: Partial<SportEquipment>) => {
    // If offline, handle locally
    if (isOffline) {
      // Store in offline storage
      offlineService.addPendingOperation({
        type: 'UPDATE',
        data: { id, ...updates },
        timestamp: Date.now()
      });
      
      // Update local state
      setEquipment(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      return { id, ...updates };
    }

    // If online, try API call
    try {
      const response = await fetch(`/api/equipment?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update equipment');
      
      const data = await response.json();
      setEquipment(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      // If API call fails, handle as offline
      offlineService.addPendingOperation({
        type: 'UPDATE',
        data: { id, ...updates },
        timestamp: Date.now()
      });
      
      setEquipment(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      return { id, ...updates };
    }
  };

  // Delete equipment
  const deleteEquipment = async (id: string) => {
    // If offline, handle locally
    if (isOffline) {
      // Store in offline storage
      offlineService.addPendingOperation({
        type: 'DELETE',
        data: { id },
        timestamp: Date.now()
      });
      
      // Update local state
      setEquipment(prev => prev.filter(item => item.id !== id));
      return;
    }

    // If online, try API call
    try {
      const response = await fetch(`/api/equipment?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete equipment');
      
      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      // If API call fails, handle as offline
      offlineService.addPendingOperation({
        type: 'DELETE',
        data: { id },
        timestamp: Date.now()
      });
      
      setEquipment(prev => prev.filter(item => item.id !== id));
    }
  };

  return {
    equipment,
    loading,
    error,
    isSyncing,
    addEquipment,
    updateEquipment,
    deleteEquipment
  };
} 