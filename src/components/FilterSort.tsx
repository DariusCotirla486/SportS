'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types/types';

interface FilterSortProps {
  onCategoryChange: (categoryId: string | null) => void;
  onPriceSortChange: (sort: 'none' | 'high-low' | 'low-high') => void;
  activeCategoryId: string | null;
  priceSort: 'none' | 'high-low' | 'low-high';
}

export default function FilterSort({
  onCategoryChange,
  onPriceSortChange,
  activeCategoryId,
  priceSort
}: FilterSortProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category
          </label>
          <select
            value={activeCategoryId || ''}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Sort by Price
          </label>
          <select
            value={priceSort}
            onChange={(e) => onPriceSortChange(e.target.value as 'none' | 'high-low' | 'low-high')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          >
            <option value="none">No Sorting</option>
            <option value="high-low">Price: High to Low</option>
            <option value="low-high">Price: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );
} 