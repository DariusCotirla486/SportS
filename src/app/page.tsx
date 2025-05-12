'use client';

import { useState } from 'react';
import { SportEquipment } from '@/lib/db';
import EquipmentList from '@/components/EquipmentList';
import FilterSort from '@/components/FilterSort';
import EquipmentCharts from '@/components/EquipmentCharts';
import { useEquipment } from '@/hooks/useEquipment';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceSort, setPriceSort] = useState<'none' | 'high-low' | 'low-high'>('none');
  const { equipment } = useEquipment();

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sports Equipment Store</h1>
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
      </div>
    </main>
  );
}