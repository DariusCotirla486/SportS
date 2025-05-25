import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add CORS headers
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

// GET - Fetch items for specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = await getConnection();
    const result = await pool.query(`
      SELECT i.*, c.name as category_name, s.quantity
      FROM items i
      LEFT JOIN item_categories c ON i.category_id = c.id
      LEFT JOIN item_stock s ON i.id = s.item_id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
    `, [user_id]);
    
    return NextResponse.json(result.rows, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST - Add new item (user_id from body)
export async function POST(request: NextRequest) {
  try {
    const item = await request.json();
    const user_id = item.user_id;
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400, headers: corsHeaders() }
      );
    }
    const pool = await getConnection();
    // Insert into items with user_id from body
    const result = await pool.query(
      `INSERT INTO items (
        name, brand, category_id, price, description, 
        condition, image_filename, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        item.name,
        item.brand,
        item.category_id,
        item.price,
        item.description,
        item.condition,
        item.image_filename,
        user_id
      ]
    );
    if (item.quantity !== undefined) {
      await pool.query(
        `INSERT INTO item_stock (item_id, quantity) VALUES ($1, $2)
         ON CONFLICT (item_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [result.rows[0].id, item.quantity]
      );
    }
    const fullItem = await pool.query(
      `SELECT i.*, c.name as category_name, s.quantity
       FROM items i
       LEFT JOIN item_categories c ON i.category_id = c.id
       LEFT JOIN item_stock s ON i.id = s.item_id
       WHERE i.id = $1`,
      [result.rows[0].id]
    );
    return NextResponse.json(fullItem.rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// PUT - Update item (user_id from body, must match item's user_id)
export async function PUT(request: NextRequest) {
  try {
    const { id, user_id, ...updates } = await request.json();
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400, headers: corsHeaders() }
      );
    }
    const pool = await getConnection();
    // Check ownership
    const checkResult = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404, headers: corsHeaders() }
      );
    }
    // Update the item
    await pool.query(
      `UPDATE items 
       SET name = $1, brand = $2, category_id = $3, 
           price = $4, description = $5, condition = $6, 
           image_filename = $7, updated_at = NOW()
       WHERE id = $8 AND user_id = $9`,
      [
        updates.name,
        updates.brand,
        updates.category_id,
        updates.price,
        updates.description,
        updates.condition,
        updates.image_filename,
        id,
        user_id
      ]
    );
    if (updates.quantity !== undefined) {
      await pool.query(
        `INSERT INTO item_stock (item_id, quantity) VALUES ($1, $2)
         ON CONFLICT (item_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [id, updates.quantity]
      );
    }
    const fullItem = await pool.query(
      `SELECT i.*, c.name as category_name, s.quantity
       FROM items i
       LEFT JOIN item_categories c ON i.category_id = c.id
       LEFT JOIN item_stock s ON i.id = s.item_id
       WHERE i.id = $1`,
      [id]
    );
    return NextResponse.json(fullItem.rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE - Remove item (user_id from query, must match item's user_id)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');
    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Item ID and user_id are required' },
        { status: 400, headers: corsHeaders() }
      );
    }
    const pool = await getConnection();
    // Check ownership
    const checkResult = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404, headers: corsHeaders() }
      );
    }
    // Delete from item_stock first (if exists)
    await pool.query('DELETE FROM item_stock WHERE item_id = $1', [id]);
    // Delete the item
    await pool.query('DELETE FROM items WHERE id = $1 AND user_id = $2', [id, user_id]);
    return NextResponse.json(
      { message: 'Item deleted successfully' },
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