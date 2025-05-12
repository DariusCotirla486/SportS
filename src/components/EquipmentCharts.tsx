'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { SportEquipment } from '@/types/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface EquipmentChartsProps {
  equipment: SportEquipment[];
}

export default function EquipmentCharts({ equipment }: EquipmentChartsProps) {
  const chartData = useMemo(() => {
    // Update price distribution
    const priceRanges = [0, 0, 0, 0];
    equipment.forEach(item => {
      const price = Number(item.price);
      if (price <= 50) priceRanges[0]++;
      else if (price <= 100) priceRanges[1]++;
      else if (price <= 200) priceRanges[2]++;
      else priceRanges[3]++;
    });

    // Update category distribution
    const categoryCounts = new Map<string, number>();
    equipment.forEach(item => {
      const count = categoryCounts.get(item.category_name) || 0;
      categoryCounts.set(item.category_name, count + 1);
    });

    // Update price trend (last 5 items)
    const lastItems = equipment.slice(-5);
    const priceTrend = lastItems.map(item => Number(item.price));
    const labels = lastItems.map(item => item.name);

    return {
      priceDistribution: {
        labels: ['$0-50', '$51-100', '$101-200', '$201+'],
        datasets: [{
          label: 'Number of Items',
          data: priceRanges,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }],
      },
      categoryDistribution: {
        labels: Array.from(categoryCounts.keys()),
        datasets: [{
          data: Array.from(categoryCounts.values()),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
        }],
      },
      priceTrend: {
        labels,
        datasets: [{
          label: 'Price',
          data: priceTrend,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        }],
      },
    };
  }, [equipment]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Price Distribution</h3>
        <Bar
          data={chartData.priceDistribution}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            animation: {
              duration: 500
            }
          }}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Category Distribution</h3>
        <Pie
          data={chartData.categoryDistribution}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            animation: {
              duration: 500
            }
          }}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Price Trend</h3>
        <Line
          data={chartData.priceTrend}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            animation: {
              duration: 500
            }
          }}
        />
      </div>
    </div>
  );
} 