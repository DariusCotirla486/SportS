import { useState, useEffect } from 'react';
import { SportEquipment } from '@/types/types';

export function useEquipment() {
  const [equipment, setEquipment] = useState<SportEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: null,
          sort_by: 'price',
          sort_order: 'none'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch equipment');
      }

      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const addEquipment = async (newEquipment: Omit<SportEquipment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEquipment),
      });

      if (!response.ok) {
        throw new Error('Failed to add equipment');
      }

      await fetchEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add equipment');
      throw err;
    }
  };

  const updateEquipment = async (id: string, updatedEquipment: Partial<SportEquipment>) => {
    try {
      const response = await fetch(`/api/equipment?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEquipment),
      });

      if (!response.ok) {
        throw new Error('Failed to update equipment');
      }

      await fetchEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update equipment');
      throw err;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }

      await fetchEquipment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete equipment');
      throw err;
    }
  };

  return {
    equipment,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  };
} 