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
    console.log('Received filter request:', data);

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid request body');
    }

    const pool = await getConnection();
    console.log('Database connection established');

    // Convert sort order to match the function's expected format
    let sortOrder = 'none';
    if (data.sort_by === 'price') {
      sortOrder = data.sort_order === 'asc' ? 'low-high' : 'high-low';
    }

    // Validate category_id if provided
    let categoryId = null;
    if (data.category_id) {
      try {
        // Validate UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.category_id)) {
          throw new Error('Invalid category_id format');
        }
        categoryId = data.category_id;
      } catch (error) {
        console.error('Invalid category_id:', error);
        throw new Error('Invalid category_id format');
      }
    }

    console.log('Executing query with params:', { category_id: categoryId, sortOrder });

    try {
      // Call the PostgreSQL function
      const result = await pool.query(
        'SELECT * FROM get_filtered_items($1, $2)',
        [categoryId, sortOrder]
      );

      console.log('Query executed successfully, rows returned:', result.rows.length);

      // Convert dates to ISO strings and ensure price is a number
      const formattedRows = result.rows.map(row => ({
        ...row,
        price: Number(row.price), // Convert price to number
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      }));

      return NextResponse.json(formattedRows, { headers: corsHeaders() });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw new Error(`Database query failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error filtering items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to filter items' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 