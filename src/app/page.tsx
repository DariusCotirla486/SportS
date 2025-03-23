'use client';

import { useState } from 'react';
import { EquipmentProvider } from '../context/EquipmentContext';
import EquipmentList from '../components/EquipmentList';
import EquipmentForm from '../components/EquipmentForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceSort, setPriceSort] = useState<'none' | 'high-low' | 'low-high'>('none');

  const categories = ['All', 'Football', 'Basketball', 'Tennis', 'Other'];
  const saleCategory = 'Football';
  const salePercentage = 80;

  return (
    <EquipmentProvider>
      <main className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Flash Sale Banner */}
        <div className="fixed left-4 top-4 z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            <h2 className="text-xl font-bold">Flash Sale!</h2>
            <p className="text-sm">{saleCategory} - {salePercentage}%</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-red-500 mb-2">Check Our Product</p>
          <h1 className="text-3xl font-bold">Brand New Sport Equipment</h1>
        </div>

        {/* Navigation Categories */}
        <div className="flex justify-center gap-8 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === category
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <EquipmentList activeCategory={activeCategory} priceSort={priceSort} />
        
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add a product
          </button>
          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value as typeof priceSort)}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors appearance-none cursor-pointer relative"
          >
            <option value="none">Sort by Price</option>
            <option value="high-low">Price: High to Low</option>
            <option value="low-high">Price: Low to High</option>
          </select>
        </div>

        {showForm && (
          <EquipmentForm
            onClose={() => setShowForm(false)}
          />
        )}
      </main>
    </EquipmentProvider>
  );
}
