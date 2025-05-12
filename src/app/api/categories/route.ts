import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
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

// GET all categories
export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.query('SELECT id, name FROM item_categories ORDER BY name');
    return NextResponse.json(result.rows, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 