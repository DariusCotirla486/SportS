import { NextResponse } from 'next/server';
import { equipment } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');

  // Filter by category
  let filteredEquipment = equipment;
  if (category && category !== 'All') {
    filteredEquipment = equipment.filter(item => item.category === category);
  }

  // Sort by price
  if (sort === 'high-low') {
    filteredEquipment.sort((a, b) => b.price - a.price);
  } else if (sort === 'low-high') {
    filteredEquipment.sort((a, b) => a.price - b.price);
  }

  return NextResponse.json(filteredEquipment);
} 