import { NextResponse } from 'next/server';
import { equipment } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Or specify your frontend domain
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

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

  return NextResponse.json(filteredEquipment, {
    headers: corsHeaders(),
  });
} 