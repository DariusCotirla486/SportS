import { NextResponse } from 'next/server';
import { equipment, SportEquipment } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Or specify your frontend domain
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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
  return NextResponse.json(equipment, {
    headers: corsHeaders(),
  });
}

// POST new equipment
export async function POST(request: Request) {
  try {
    const newEquipment = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'price', 'brand', 'inStock', 'description', 'condition', 'imageUrl'];
    const missingFields = requiredFields.filter(field => !(field in newEquipment));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      );
    }

    // Validate price and stock values
    if (newEquipment.price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      );
    }

    if (newEquipment.inStock < 0 || !Number.isInteger(newEquipment.inStock)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative integer' },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      );
    }

    // Generate a simple numeric ID that continues from the last item
    const id = (equipment.length + 1).toString();
    const equipmentWithId: SportEquipment = { ...newEquipment, id };
    equipment.push(equipmentWithId);
    return NextResponse.json(equipmentWithId, { 
      status: 201,
      headers: corsHeaders(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add equipment' }, 
      { 
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

// PATCH (update) equipment by ID
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' }, 
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    const updatedData = await request.json();
    const index = equipment.findIndex((item: SportEquipment) => String(item.id) === String(id));
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Equipment not found' }, 
        { 
          status: 404,
          headers: corsHeaders(),
        }
      );
    }

    const updatedEquipment: SportEquipment = { ...equipment[index], ...updatedData, id: equipment[index].id };
    equipment[index] = updatedEquipment;
    return NextResponse.json(updatedEquipment, {
      headers: corsHeaders(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update equipment' }, 
      { 
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

// DELETE equipment by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' }, 
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    const index = equipment.findIndex((item: SportEquipment) => String(item.id) === String(id));
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Equipment not found' }, 
        { 
          status: 404,
          headers: corsHeaders(),
        }
      );
    }

    equipment.splice(index, 1);
    return NextResponse.json(
      { success: true },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete equipment' }, 
      { 
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
} 