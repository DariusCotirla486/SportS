import { describe, it, expect } from 'vitest';
import { PATCH, GET } from '../route';
import { equipment } from '@/lib/db';

describe('Equipment API PATCH operation', () => {
  it('should update the name field', async () => {
    // Get initial data
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newName = 'Updated Name';

    // Update the name
    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.name).toBe(newName);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should update the category field', async () => {
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newCategory = 'Updated Category';

    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: newCategory })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.category).toBe(newCategory);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should update the price field', async () => {
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newPrice = 149.99;

    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ price: newPrice })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.price).toBe(newPrice);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should update the brand field', async () => {
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newBrand = 'Updated Brand';

    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ brand: newBrand })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.brand).toBe(newBrand);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should update the inStock field', async () => {
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newStock = 25;

    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inStock: newStock })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.inStock).toBe(newStock);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should update the description field', async () => {
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newDescription = 'Updated description for testing purposes';

    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description: newDescription })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.description).toBe(newDescription);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should update the condition field', async () => {
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToUpdate = initialData[0];
    const newCondition = 'Used';

    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToUpdate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ condition: newCondition })
    });
    const response = await PATCH(request);
    const updatedItem = await response.json();

    expect(updatedItem.condition).toBe(newCondition);
    expect(updatedItem.id).toBe(itemToUpdate.id);
  });

  it('should handle non-existent ID', async () => {
    const request = new Request('http://localhost:3000/api/equipment?id=non-existent-id', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'New Name' })
    });
    const response = await PATCH(request);
    expect(response.status).toBe(404);
  });
}); 