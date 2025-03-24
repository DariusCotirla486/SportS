'use client';

import { useEquipment } from '../context/EquipmentContext';
import { SportEquipment } from '../types/types';
import Image from 'next/image';
import { useState } from 'react';
import EquipmentForm from './EquipmentForm';

interface EquipmentListProps {
  activeCategory: string;
  priceSort: 'none' | 'high-low' | 'low-high';
}

export default function EquipmentList({ activeCategory, priceSort }: EquipmentListProps) {
  const { state, dispatch } = useEquipment();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEquipment, setEditingEquipment] = useState<SportEquipment | null>(null);
  const itemsPerPage = 8;

  // Define which categories are on sale
  const saleCategories = {
    'Football': 80, // 80% discount
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_EQUIPMENT', payload: id });
  };

  const handleEdit = (equipment: SportEquipment) => {
    setEditingEquipment(equipment);
  };

  // Helper function to determine if an item belongs to a category
  const belongsToCategory = (item: SportEquipment, category: string): boolean => {
    if (category === 'All') {
      return true;
    }
    
    const itemNameLower = item.name.toLowerCase();
    
    switch (category) {
      case 'Football':
        return itemNameLower.includes('soccer') || 
               itemNameLower.includes('football') ||
               (item.category === 'Team Sports' && itemNameLower.includes('grid'));
      case 'Basketball':
        return itemNameLower.includes('basketball');
      case 'Tennis':
        return itemNameLower.includes('tennis');
      case 'Other':
        return !itemNameLower.includes('soccer') && 
               !itemNameLower.includes('football') && 
               !itemNameLower.includes('basketball') && 
               !itemNameLower.includes('tennis');
      default:
        return true;
    }
  };

  // Filter equipment by category
  const filteredEquipment = state.equipment.filter(item => belongsToCategory(item, activeCategory));

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

  // Get the first category that has items on sale
  const saleCategory = Object.keys(saleCategories)[0];
  const salePercentage = saleCategories[saleCategory as keyof typeof saleCategories];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
        {paginatedEquipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
            {/* Price Label */}
            {item.price === Math.max(...state.equipment.map(e => e.price)) && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold z-10">
                Most Expensive
              </div>
            )}
            {item.price === Math.min(...state.equipment.map(e => e.price)) && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold z-10">
                Cheapest
              </div>
            )}
            
            <div className="relative h-48">
              <Image
                src={item.imageUrl || 'https://placehold.co/400x400/gray/white?text=Product'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-black">{item.name}</h3>
              <div className="flex items-center">
                {belongsToCategory(item, saleCategory) ? (
                  <>
                    <span className="line-through text-gray-600 mr-2">${item.price.toFixed(2)}</span>
                    <span className="font-semibold text-red-500">${(item.price * (1 - salePercentage / 100)).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="font-semibold text-black">${item.price.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 rounded-full hover:bg-gray-100 text-blue-500"
                  title="Edit item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                      handleDelete(item.id);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                  title="Delete item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingEquipment && (
        <EquipmentForm
          equipment={editingEquipment}
          onClose={() => setEditingEquipment(null)}
        />
      )}
    </div>
  );
} 