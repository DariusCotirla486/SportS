'use client';

import { useState, useEffect } from 'react';
import { SportEquipment } from '@/types/types';
import { Category } from '@/types/types';

interface EquipmentFormProps {
  onClose: () => void;
  equipment?: SportEquipment;
  onUpdate?: (equipment: SportEquipment) => void;
}

export default function EquipmentForm({ onClose, equipment, onUpdate }: EquipmentFormProps) {
  const [formData, setFormData] = useState<Partial<SportEquipment>>({
    name: '',
    brand: '',
    category_id: '',
    price: 0,
    description: '',
    condition: 'New',
    image_filename: null,
    quantity: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        brand: equipment.brand,
        category_id: equipment.category_id,
        price: equipment.price,
        description: equipment.description || '',
        condition: equipment.condition,
        image_filename: equipment.image_filename || null,
        quantity: equipment.quantity
      });
    }
  }, [equipment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, upload the image if there is one
      let imageFilename: string | null = formData.image_filename || null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        const uploadData = await uploadResponse.json();
        imageFilename = uploadData.filename;
      }

      const equipmentData: SportEquipment = {
        id: equipment?.id || '',
        name: formData.name || '',
        brand: formData.brand || '',
        category_id: formData.category_id || '',
        category_name: categories.find(c => c.id === formData.category_id)?.name || '',
        price: formData.price || 0,
        description: formData.description || '',
        condition: formData.condition || 'New',
        image_filename: imageFilename,
        quantity: formData.quantity || 0,
        created_at: equipment?.created_at || new Date(),
        updated_at: new Date()
      };

      if (onUpdate) {
        onUpdate(equipmentData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-black mb-4">
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-black font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : equipment ? 'Update' : 'Add'} Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 