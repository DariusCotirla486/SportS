import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Get database connection
    const pool = await getConnection();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get regular user role ID
    const roleResult = await pool.query(
      "SELECT id FROM user_roles WHERE name = 'user'"
    );
    const roleId = roleResult.rows[0].id;

    // Create user with plain password
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name`,
      [email, password, name, roleId]
    );

    const newUser = result.rows[0];

    // Create response
    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: 'user'
        }
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 