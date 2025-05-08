import { describe, it, expect } from 'vitest';
import { POST } from '../route';
import { SportEquipment } from '@/lib/db';

describe('Equipment API POST operation', () => {
  const mockEquipment: Omit<SportEquipment, 'id'> = {
    name: 'Test Equipment',
    category: 'Test Category',
    price: 99.99,
    brand: 'Test Brand',
    inStock: 10,
    description: 'Test Description',
    condition: 'New',
    imageUrl: 'https://placehold.co/400x400/blue/white?text=Test'
  };

  it('should successfully add new equipment', async () => {
    const request = new Request('http://localhost:3000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockEquipment)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(mockEquipment.name);
    expect(data.category).toBe(mockEquipment.category);
    expect(data.price).toBe(mockEquipment.price);
    expect(data.brand).toBe(mockEquipment.brand);
    expect(data.inStock).toBe(mockEquipment.inStock);
    expect(data.description).toBe(mockEquipment.description);
    expect(data.condition).toBe(mockEquipment.condition);
    expect(data.imageUrl).toBe(mockEquipment.imageUrl);
  });

  it('should generate unique IDs for new equipment', async () => {
    const request1 = new Request('http://localhost:3000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockEquipment)
    });

    const request2 = new Request('http://localhost:3000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockEquipment)
    });

    const response1 = await POST(request1);
    const response2 = await POST(request2);
    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.id).not.toBe(data2.id);
  });

  it('should handle invalid equipment data', async () => {
    const invalidEquipment = {
      name: 'Test Equipment',
      // Missing required fields
    };

    const request = new Request('http://localhost:3000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidEquipment)
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('should validate price and stock values', async () => {
    const invalidEquipment = {
      ...mockEquipment,
      price: -10, // Invalid negative price
      inStock: -5  // Invalid negative stock
    };

    const request = new Request('http://localhost:3000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidEquipment)
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
}); 