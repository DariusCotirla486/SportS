'use client';

import { SportEquipment } from '@/lib/db';
import { useState } from 'react';

interface EquipmentFormProps {
  onClose: () => void;
  equipment?: SportEquipment;
  onUpdate?: (equipment: SportEquipment) => void;
}

export default function EquipmentForm({ onClose, equipment, onUpdate }: EquipmentFormProps) {
  const [formData, setFormData] = useState<Partial<SportEquipment>>(
    equipment || {
      name: '',
      category: '',
      price: 0,
      brand: '',
      inStock: 0,
      description: '',
      condition: '',
      imageUrl: ''
    }
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(equipment?.imageUrl || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'inStock' ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = equipment ? 'PATCH' : 'POST';
      const url = equipment 
        ? `/api/equipment?id=${equipment.id}`
        : '/api/equipment';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save equipment');
      }

      if (onUpdate) {
        onUpdate(formData as SportEquipment);
      }
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-black mb-4">
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
        </h2>
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
            <label className="block text-black font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            />
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
            <label className="block text-black font-medium mb-1">In Stock</label>
            <input
              type="number"
              name="inStock"
              value={formData.inStock}
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
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Condition</label>
            <input
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
              required={!equipment}
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {equipment ? 'Update' : 'Add'} Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 