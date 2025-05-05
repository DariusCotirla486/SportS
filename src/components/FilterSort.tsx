'use client';

import { useState, useEffect } from 'react';
import { SportEquipment } from '@/lib/db';

interface FilterSortProps {
  onCategoryChange: (category: string) => void;
  onPriceSortChange: (sort: 'none' | 'high-low' | 'low-high') => void;
  activeCategory: string;
  priceSort: 'none' | 'high-low' | 'low-high';
}

export default function FilterSort({
  onCategoryChange,
  onPriceSortChange,
  activeCategory,
  priceSort
}: FilterSortProps) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/equipment');
        const data = await response.json() as SportEquipment[];
        const uniqueCategories = Array.from(new Set(data.map((item) => item.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-black mb-2">
            Category
          </label>
          <select
            value={activeCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
          >
            <option value="All" className="text-black">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category} className="text-black">
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-black mb-2">
            Sort by Price
          </label>
          <select
            value={priceSort}
            onChange={(e) => onPriceSortChange(e.target.value as 'none' | 'high-low' | 'low-high')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
          >
            <option value="none" className="text-black">No Sort</option>
            <option value="high-low" className="text-black">Price: High to Low</option>
            <option value="low-high" className="text-black">Price: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );
} 