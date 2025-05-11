'use client';

import { SportEquipment } from '@/lib/db';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import EquipmentForm from './EquipmentForm';
import { useEquipment } from '@/hooks/useEquipment';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface EquipmentListProps {
  activeCategory: string;
  priceSort: 'none' | 'high-low' | 'low-high';
}

export default function EquipmentList({ activeCategory, priceSort }: EquipmentListProps) {
  const [editingEquipment, setEditingEquipment] = useState<SportEquipment | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const itemsPerPage = 8;
  const { equipment, loading, error, deleteEquipment, updateEquipment, addEquipment } = useEquipment();
  const { isOnline, isServerAvailable } = useConnectionStatus();
  const [page, setPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Filter and sort equipment
  const filteredAndSortedEquipment = equipment
    .filter(item => activeCategory === 'All' || item.category === activeCategory)
    .sort((a, b) => {
      if (priceSort === 'high-low') return b.price - a.price;
      if (priceSort === 'low-high') return a.price - b.price;
      return 0;
    });

  // Calculate displayed items based on current page
  const displayedItems = filteredAndSortedEquipment.slice(0, page * itemsPerPage);
  const hasMore = displayedItems.length < filteredAndSortedEquipment.length;

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [loading, hasMore]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, priceSort]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEquipment(id);
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const handleEdit = (equipment: SportEquipment) => {
    setEditingEquipment(equipment);
  };

  const handleUpdate = async (updatedEquipment: SportEquipment) => {
    try {
      await updateEquipment(updatedEquipment.id, updatedEquipment);
      setEditingEquipment(undefined);
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const handleAddNew = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEquipment(undefined);
  };

  const handleFormSubmit = async (newEquipment: SportEquipment) => {
    try {
      if (editingEquipment) {
        await handleUpdate(newEquipment);
      } else {
        await addEquipment(newEquipment);
      }
      handleFormClose();
    } catch (error) {
      console.error('Error handling equipment:', error);
    }
  };

  // Show loading state
  if (loading && displayedItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading equipment...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  // If form is open, only show the form
  if (isFormOpen || editingEquipment) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <EquipmentForm
          onClose={handleFormClose}
          equipment={editingEquipment}
          onUpdate={handleFormSubmit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {!isOnline && (
            <span className="text-yellow-600 font-medium">⚠️ Working offline - Changes will sync when online</span>
          )}
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Equipment
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedItems.map((item) => (
          <div key={`${item.id}-${item.name}`} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.brand}</p>
              <p className="text-lg font-bold text-blue-600 mt-2">${item.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">In Stock: {item.inStock}</p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading trigger element */}
      <div
        ref={loadingRef}
        className="h-20 flex items-center justify-center"
      >
        {loading && (
          <div className="text-gray-500">
            Loading more items...
          </div>
        )}
        {!loading && !hasMore && displayedItems.length > 0 && (
          <div className="text-gray-500">
            No more items to load
          </div>
        )}
      </div>
    </div>
  );
} 