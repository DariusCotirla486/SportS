import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

// POST filter equipment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const pool = await getConnection();

    // Build the query based on filters
    let query = 'SELECT * FROM get_all_items() WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      query += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${data.name}%`);
      paramIndex++;
    }

    if (data.brand) {
      query += ` AND brand ILIKE $${paramIndex}`;
      params.push(`%${data.brand}%`);
      paramIndex++;
    }

    if (data.category_id) {
      query += ` AND category_id = $${paramIndex}`;
      params.push(data.category_id);
      paramIndex++;
    }

    if (data.condition) {
      query += ` AND condition = $${paramIndex}`;
      params.push(data.condition);
      paramIndex++;
    }

    if (data.min_price !== undefined) {
      query += ` AND price >= $${paramIndex}`;
      params.push(data.min_price);
      paramIndex++;
    }

    if (data.max_price !== undefined) {
      query += ` AND price <= $${paramIndex}`;
      params.push(data.max_price);
      paramIndex++;
    }

    if (data.in_stock !== undefined) {
      if (data.in_stock) {
        query += ' AND quantity > 0';
      } else {
        query += ' AND quantity = 0';
      }
    }

    // Add sorting
    if (data.sort_by) {
      const validSortColumns = ['name', 'brand', 'price', 'created_at', 'updated_at'];
      const sortColumn = validSortColumns.includes(data.sort_by) ? data.sort_by : 'created_at';
      const sortOrder = data.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error filtering items:', error);
    return NextResponse.json(
      { error: 'Failed to filter items' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 