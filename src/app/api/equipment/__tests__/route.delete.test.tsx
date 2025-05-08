import { describe, it, expect } from 'vitest';
import { DELETE, GET } from '../route';
import { equipment } from '@/lib/db';

describe('Equipment API DELETE operation', () => {
  it('should decrease equipment count by 1 after deletion', async () => {
    // Get initial count
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const initialCount = initialData.length;

    // Delete the first item
    const request = new Request(`http://localhost:3000/api/equipment?id=${initialData[0].id}`, {
      method: 'DELETE'
    });
    await DELETE(request);

    // Get new count
    const finalResponse = await GET();
    const finalData = await finalResponse.json();
    const finalCount = finalData.length;

    expect(finalCount).toBe(initialCount - 1);
  });

  it('should remove the deleted equipment from the list', async () => {
    // Get initial data
    const initialResponse = await GET();
    const initialData = await initialResponse.json();
    const itemToDelete = initialData[0];

    // Delete the item
    const request = new Request(`http://localhost:3000/api/equipment?id=${itemToDelete.id}`, {
      method: 'DELETE'
    });
    await DELETE(request);

    // Get final data
    const finalResponse = await GET();
    const finalData = await finalResponse.json();

    // Check that the deleted item is not in the list
    const deletedItemStillExists = finalData.some((item: any) => item.id === itemToDelete.id);
    expect(deletedItemStillExists).toBe(false);
  });
}); 