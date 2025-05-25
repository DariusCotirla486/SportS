import { useState, useEffect } from 'react';
import { SportEquipment } from '@/types/types';

export function useEquipment() {
  const [equipment, setEquipment] = useState<SportEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      console.debug('Fetching equipment...');
      const user_id = localStorage.getItem('user_id');
      const response = await fetch(`/api/equipment?user_id=${user_id}`, {
        headers: {
          'x-user-id': user_id || '',
        },
      });
      console.debug('GET /api/equipment status:', response.status);
      const data = await response.json();
      console.debug('GET /api/equipment response:', data);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = async (newEquipment: Omit<SportEquipment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.debug('Adding equipment:', newEquipment);
      const user_id = localStorage.getItem('user_id');
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user_id || '',
        },
        body: JSON.stringify({ ...newEquipment, user_id }),
        credentials: 'include',
      });
      console.debug('POST /api/equipment status:', response.status);
      const addedEquipment = await response.json();
      console.debug('POST /api/equipment response:', addedEquipment);
      if (!response.ok) {
        throw new Error('Failed to add equipment');
      }
      setEquipment(prev => [...prev, addedEquipment]);
      return addedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add equipment');
      throw err;
    }
  };

  const updateEquipment = async (id: string, updates: Partial<SportEquipment>) => {
    try {
      console.debug('Updating equipment:', id, updates);
      const user_id = localStorage.getItem('user_id');
      const response = await fetch('/api/equipment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user_id || '',
        },
        body: JSON.stringify({ id, ...updates, user_id }),
        credentials: 'include',
      });
      console.debug('PUT /api/equipment status:', response.status);
      const updatedEquipment = await response.json();
      console.debug('PUT /api/equipment response:', updatedEquipment);
      if (!response.ok) {
        throw new Error('Failed to update equipment');
      }
      setEquipment(prev =>
        prev.map(item => (item.id === id ? updatedEquipment : item))
      );
      return updatedEquipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update equipment');
      throw err;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      console.debug('Deleting equipment:', id);
      const user_id = localStorage.getItem('user_id');
      const response = await fetch(`/api/equipment?id=${id}&user_id=${user_id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user_id || '',
        },
        credentials: 'include',
      });
      console.debug('DELETE /api/equipment status:', response.status);
      const respBody = await response.clone().json().catch(() => null);
      console.debug('DELETE /api/equipment response:', respBody);
      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }
      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete equipment');
      throw err;
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    refreshEquipment: fetchEquipment,
  };
} 