'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SportEquipment } from '@/types/types';
import EquipmentList from '@/components/EquipmentList';
import FilterSort from '@/components/FilterSort';
import EquipmentCharts from '@/components/EquipmentCharts';
import { useEquipment } from '@/hooks/useEquipment';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [priceSort, setPriceSort] = useState<'none' | 'high-low' | 'low-high'>('none');
  const { equipment } = useEquipment();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    if (userId && userRole) {
      setUser({
        id: userId,
        role: userRole,
        email: '', // These fields are not needed for basic functionality
        name: ''
      });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Equipment Store</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Equipment Store</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-blue-600 hover:text-blue-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <FilterSort
            activeCategoryId={activeCategoryId}
            priceSort={priceSort}
            onCategoryChange={setActiveCategoryId}
            onPriceSortChange={setPriceSort}
          />
        </div>

        <div className="mb-8">
          <EquipmentCharts equipment={equipment} />
        </div>

        <EquipmentList
          activeCategoryId={activeCategoryId}
          priceSort={priceSort}
        />
      </main>
    </div>
  );
}