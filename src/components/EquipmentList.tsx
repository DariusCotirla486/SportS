'use client';

import { SportEquipment } from '@/lib/db';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import EquipmentForm from './EquipmentForm';

interface EquipmentListProps {
  activeCategory: string;
  priceSort: 'none' | 'high-low' | 'low-high';
}

export default function EquipmentList({ activeCategory, priceSort }: EquipmentListProps) {
  const [equipment, setEquipment] = useState<SportEquipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEquipment, setEditingEquipment] = useState<SportEquipment | null>(null);
  const itemsPerPage = 8;

  // Fetch equipment data
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/equipment');
        const data = await response.json();
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };
    fetchEquipment();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }
      setEquipment(prevEquipment => prevEquipment.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const handleEdit = (equipment: SportEquipment) => {
    setEditingEquipment(equipment);
  };

  const handleUpdate = async (updatedEquipment: SportEquipment) => {
    try {
      const response = await fetch(`/api/equipment?id=${updatedEquipment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEquipment)
      });
      if (!response.ok) {
        throw new Error('Failed to update equipment');
      }
      setEquipment(prevEquipment => 
        prevEquipment.map(item => 
          item.id === updatedEquipment.id ? updatedEquipment : item
        )
      );
      setEditingEquipment(null);
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  // Helper function to determine if an item belongs to a category
  const belongsToCategory = (item: SportEquipment, category: string): boolean => {
    if (category === 'All') {
      return true;
    }
    return item.category === category;
  };

  // Filter equipment by category
  const filteredEquipment = equipment.filter(item => belongsToCategory(item, activeCategory));

  // Sort equipment by price
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (priceSort === 'high-low') {
      return b.price - a.price;
    } else if (priceSort === 'low-high') {
      return a.price - b.price;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipment = sortedEquipment.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {editingEquipment && (
        <EquipmentForm
          onClose={() => setEditingEquipment(null)}
          equipment={editingEquipment}
          onUpdate={handleUpdate}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedEquipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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

      <div className="flex justify-center space-x-4 mt-8 bg-white p-4 rounded-lg shadow-md">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Page</span>
          <span className="font-semibold text-blue-600">{currentPage}</span>
          <span className="text-gray-700">of</span>
          <span className="font-semibold text-blue-600">{totalPages}</span>
        </div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
} 