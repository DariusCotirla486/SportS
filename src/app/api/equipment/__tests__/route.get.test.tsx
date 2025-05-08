import { describe, it, expect } from 'vitest';
import { GET } from '../route';
import { equipment, SportEquipment } from '@/lib/db';

describe('Equipment API', () => {
  it('should return all equipment items', async () => {
    // Call the GET handler
    const response = await GET();
    
    // Parse the response
    const data = await response.json();
    
    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual(equipment);
    expect(data.length).toBe(equipment.length);
  });

  it('should return equipment items with correct data structure', async () => {
    const response = await GET();
    const data = await response.json();
    
    // Check first item has all required fields
    const firstItem = data[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('name');
    expect(firstItem).toHaveProperty('category');
    expect(firstItem).toHaveProperty('price');
    expect(firstItem).toHaveProperty('brand');
    expect(firstItem).toHaveProperty('inStock');
    expect(firstItem).toHaveProperty('description');
    expect(firstItem).toHaveProperty('condition');
    expect(firstItem).toHaveProperty('imageUrl');
  });

  it('should return equipment items with correct data types', async () => {
    const response = await GET();
    const data = await response.json();
    
    // Check data types of first item
    const firstItem = data[0];
    expect(typeof firstItem.id).toBe('string');
    expect(typeof firstItem.name).toBe('string');
    expect(typeof firstItem.category).toBe('string');
    expect(typeof firstItem.price).toBe('number');
    expect(typeof firstItem.brand).toBe('string');
    expect(typeof firstItem.inStock).toBe('number');
    expect(typeof firstItem.description).toBe('string');
    expect(typeof firstItem.condition).toBe('string');
    expect(typeof firstItem.imageUrl).toBe('string');
  });

  it('should return equipment items with valid price and stock values', async () => {
    const response = await GET();
    const data = await response.json();
    
    // Check all items have valid price and stock values
    data.forEach((item: SportEquipment) => {
      expect(item.price).toBeGreaterThanOrEqual(0);
      expect(item.inStock).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(item.inStock)).toBe(true);
    });
  });

  it('should return equipment items with valid image URLs', async () => {
    const response = await GET();
    const data = await response.json();
    
    // Check all items have valid image URLs
    data.forEach((item: SportEquipment) => {
      expect(item.imageUrl).toMatch(/^https?:\/\/.+/);
    });
  });

  it('should return equipment items with unique IDs', async () => {
    const response = await GET();
    const data = await response.json();
    
    // Check all items have unique IDs
    const ids = data.map((item: SportEquipment) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
}); 