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