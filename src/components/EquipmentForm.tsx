'use client';

import { useState } from 'react';
import { useEquipment } from '../context/EquipmentContext';
import { SportEquipment } from '../types/types';

interface EquipmentFormProps {
  onClose: () => void;
  equipment?: SportEquipment;
}

export default function EquipmentForm({ onClose, equipment }: EquipmentFormProps) {
  const { dispatch } = useEquipment();
  const [formData, setFormData] = useState<SportEquipment>({
    id: equipment?.id || '',
    name: equipment?.name || '',
    category: equipment?.category || 'Ball Sports',
    price: equipment?.price || 0,
    brand: equipment?.brand || '',
    inStock: equipment?.inStock || 0,
    description: equipment?.description || '',
    condition: equipment?.condition || 'New',
    imageUrl: equipment?.imageUrl || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(equipment?.imageUrl || null);

  const [errors, setErrors] = useState<Partial<Record<keyof SportEquipment, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof SportEquipment, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (formData.inStock < 0) {
      newErrors.inStock = 'Stock cannot be negative';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.imageUrl?.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (equipment) {
      dispatch({
        type: 'UPDATE_EQUIPMENT',
        payload: { id: equipment.id, data: formData },
      });
    } else {
      dispatch({
        type: 'ADD_EQUIPMENT',
        payload: formData,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SportEquipment['category'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            >
              <option value="Ball Sports">Ball Sports</option>
              <option value="Team Sports">Team Sports</option>
              <option value="Training">Training</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            />
            {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black">In Stock</label>
            <input
              type="number"
              value={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            />
            {errors.inStock && <p className="text-red-500 text-sm">{errors.inStock}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as SportEquipment['condition'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              required
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-black
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {equipment ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 