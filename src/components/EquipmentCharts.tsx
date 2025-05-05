'use client';

import { useEffect, useState } from 'react';
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
import { SportEquipment } from '@/lib/db';

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

interface ChartData {
  priceDistribution: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  categoryDistribution: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  };
  priceTrend: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }[];
  };
}

export default function EquipmentCharts({ equipment }: EquipmentChartsProps) {
  const [chartData, setChartData] = useState<ChartData>({
    priceDistribution: {
      labels: ['$0-50', '$51-100', '$101-200', '$201+'],
      datasets: [{
        label: 'Number of Items',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }],
    },
    categoryDistribution: {
      labels: ['Football', 'Basketball', 'Tennis', 'Other'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      }],
    },
    priceTrend: {
      labels: [],
      datasets: [{
        label: 'Average Price',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }],
    },
  });

  useEffect(() => {
    // Update price distribution
    const priceRanges = [0, 0, 0, 0];
    equipment.forEach(item => {
      if (item.price <= 50) priceRanges[0]++;
      else if (item.price <= 100) priceRanges[1]++;
      else if (item.price <= 200) priceRanges[2]++;
      else priceRanges[3]++;
    });

    // Update category distribution
    const categories = [0, 0, 0, 0];
    equipment.forEach(item => {
      const name = item.name.toLowerCase();
      if (name.includes('football') || name.includes('soccer')) categories[0]++;
      else if (name.includes('basketball')) categories[1]++;
      else if (name.includes('tennis')) categories[2]++;
      else categories[3]++;
    });

    // Update price trend (last 5 items)
    const lastItems = equipment.slice(-5);
    const priceTrend = lastItems.map(item => item.price);
    const labels = lastItems.map(item => item.name);

    setChartData({
      priceDistribution: {
        ...chartData.priceDistribution,
        datasets: [{
          ...chartData.priceDistribution.datasets[0],
          data: priceRanges,
        }],
      },
      categoryDistribution: {
        ...chartData.categoryDistribution,
        datasets: [{
          ...chartData.categoryDistribution.datasets[0],
          data: categories,
        }],
      },
      priceTrend: {
        labels,
        datasets: [{
          ...chartData.priceTrend.datasets[0],
          data: priceTrend,
        }],
      },
    });
  }, [equipment]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-black">Price Distribution</h3>
        <Bar
          data={chartData.priceDistribution}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
          }}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-black">Category Distribution</h3>
        <Pie
          data={chartData.categoryDistribution}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
          }}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-black">Price Trend</h3>
        <Line
          data={chartData.priceTrend}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
          }}
        />
      </div>
    </div>
  );
} 