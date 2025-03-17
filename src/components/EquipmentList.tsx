'use client';

import { useEquipment } from '../context/EquipmentContext';
import { SportEquipment } from '../types/types';
import Image from 'next/image';

interface EquipmentListProps {
  activeCategory: string;
  priceSort: 'none' | 'high-low' | 'low-high';
}

export default function EquipmentList({ activeCategory, priceSort }: EquipmentListProps) {
  const { state, dispatch } = useEquipment();

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_EQUIPMENT', payload: id });
  };

  const handleEdit = (equipment: SportEquipment) => {
    // This will be implemented with a modal form
    console.log('Edit equipment:', equipment);
  };

  // Helper function to determine if an item belongs to a category
  const belongsToCategory = (item: SportEquipment, category: string): boolean => {
    if (category === 'Best Seller') {
      return true; // Show all items in Best Seller
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {sortedEquipment.map((item) => (
        <div key={item.id} className="flex flex-col">
          <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={item.imageUrl || 'https://placehold.co/400x400/gray/white?text=Product'}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-medium">{item.name}</h3>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <span className="line-through text-gray-400 mr-2">${item.price + 10}</span>
                <span className="font-semibold">${item.price}</span>
              </div>
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
  );
} 