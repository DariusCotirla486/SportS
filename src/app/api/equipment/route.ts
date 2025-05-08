import { NextResponse } from 'next/server';
import { equipment, SportEquipment } from '@/lib/db';

// GET all equipment
export async function GET() {
  return NextResponse.json(equipment);
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
        { status: 500 }
      );
    }

    // Validate price and stock values
    if (newEquipment.price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 500 }
      );
    }

    if (newEquipment.inStock < 0 || !Number.isInteger(newEquipment.inStock)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative integer' },
        { status: 500 }
      );
    }

    // Generate a simple numeric ID that continues from the last item
    const id = (equipment.length + 1).toString();
    const equipmentWithId: SportEquipment = { ...newEquipment, id };
    equipment.push(equipmentWithId);
    return NextResponse.json(equipmentWithId, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add equipment' }, { status: 500 });
  }
}

// PATCH (update) equipment by ID
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedData = await request.json();
    const index = equipment.findIndex((item: SportEquipment) => String(item.id) === String(id));
    
    if (index === -1) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    const updatedEquipment: SportEquipment = { ...equipment[index], ...updatedData, id: equipment[index].id };
    equipment[index] = updatedEquipment;
    return NextResponse.json(updatedEquipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

// DELETE equipment by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const index = equipment.findIndex((item: SportEquipment) => String(item.id) === String(id));
    
    if (index === -1) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    equipment.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
} 