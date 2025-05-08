import { describe, it, expect } from 'vitest';
import { GET } from '../filter/route';
import { equipment } from '@/lib/db';

describe('Equipment API Filter and Sort operations', () => {
  describe('Category Filter', () => {
    it('should only return basketball equipment when filtered by basketball category', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?category=Basketball');
      const response = await GET(request);
      const data = await response.json();

      // Check that all returned items are basketball equipment
      data.forEach((item: any) => {
        expect(item.category).toBe('Basketball');
      });

      // Check that no non-basketball items are included
      const nonBasketballItems = data.filter((item: any) => item.category !== 'Basketball');
      expect(nonBasketballItems.length).toBe(0);
    });

    it('should return all equipment when category is "All"', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?category=All');
      const response = await GET(request);
      const data = await response.json();

      expect(data.length).toBe(equipment.length);
    });
  });

  describe('Price Sort', () => {
    it('should sort equipment by price high to low', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?sort=high-low');
      const response = await GET(request);
      const data = await response.json();

      // Check that prices are in descending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].price).toBeGreaterThanOrEqual(data[i + 1].price);
      }
    });

    it('should sort equipment by price low to high', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?sort=low-high');
      const response = await GET(request);
      const data = await response.json();

      // Check that prices are in ascending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].price).toBeLessThanOrEqual(data[i + 1].price);
      }
    });

    it('should maintain original order when no sort is specified', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?sort=none');
      const response = await GET(request);
      const data = await response.json();

      // Check that the order matches the original equipment array
      expect(data).toEqual(equipment);
    });
  });

  describe('Combined Filter and Sort', () => {
    it('should filter by category and sort by price high to low', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?category=Basketball&sort=high-low');
      const response = await GET(request);
      const data = await response.json();

      // Check that all items are basketball equipment
      data.forEach((item: any) => {
        expect(item.category).toBe('Basketball');
      });

      // Check that prices are in descending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].price).toBeGreaterThanOrEqual(data[i + 1].price);
      }
    });

    it('should filter by category and sort by price low to high', async () => {
      const request = new Request('http://localhost:3000/api/equipment/filter?category=Basketball&sort=low-high');
      const response = await GET(request);
      const data = await response.json();

      // Check that all items are basketball equipment
      data.forEach((item: any) => {
        expect(item.category).toBe('Basketball');
      });

      // Check that prices are in ascending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].price).toBeLessThanOrEqual(data[i + 1].price);
      }
    });
  });
}); 