'use client';

import { useState, useCallback } from 'react';
import { SportEquipment } from '@/lib/db';
import EquipmentList from '@/components/EquipmentList';
import EquipmentForm from '@/components/EquipmentForm';
import FilterSort from '@/components/FilterSort';
import EquipmentCharts from '@/components/EquipmentCharts';
import { useEquipment } from '@/hooks/useEquipment';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceSort, setPriceSort] = useState<'none' | 'high-low' | 'low-high'>('none');
  const [showAddForm, setShowAddForm] = useState(false);
  const { equipment, loading, error, addEquipment } = useEquipment();

  const handleAddEquipment = async (newEquipment: SportEquipment) => {
    try {
      await addEquipment(newEquipment);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sports Equipment Store</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Equipment
          </button>
        </div>

        <EquipmentCharts equipment={equipment} />

        <FilterSort
          onCategoryChange={setActiveCategory}
          onPriceSortChange={setPriceSort}
          activeCategory={activeCategory}
          priceSort={priceSort}
        />

        <EquipmentList 
          activeCategory={activeCategory} 
          priceSort={priceSort} 
        />

        {showAddForm && (
          <EquipmentForm
            onClose={() => setShowAddForm(false)}
            onUpdate={handleAddEquipment}
          />
        )}
      </div>
    </main>
  );
}