import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

// GET all equipment
export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.query('SELECT * FROM get_all_items()');
    return NextResponse.json(result.rows, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST new equipment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'brand', 'category_id', 'price', 'condition'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = await getConnection();
    const result = await pool.query(
      'SELECT add_item($1, $2, $3, $4, $5, $6, $7) as id',
      [
        data.name,
        data.brand,
        data.category_id,
        data.price,
        data.description,
        data.condition,
        data.image_filename
      ]
    );

    return NextResponse.json(
      { id: result.rows[0].id },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// PUT (update) equipment by ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required (query parameter)' },
        { status: 400, headers: corsHeaders() }
      );
    }
    const updateData = await request.json();

    const pool = await getConnection();
    const result = await pool.query(
      'SELECT update_item($1, $2, $3, $4, $5, $6, $7, $8) as success',
      [
        id,
        updateData.name,
        updateData.brand,
        updateData.category_id,
        updateData.price,
        updateData.description,
        updateData.condition,
        updateData.image_filename
      ]
    );

    if (!result.rows[0].success) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE equipment by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = await getConnection();
    const result = await pool.query(
      'SELECT delete_item($1) as success',
      [id]
    );

    if (!result.rows[0].success) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 