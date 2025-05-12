'use client';

import { useEffect, useState } from 'react';
import { SportEquipment } from '@/types/types';

interface EquipmentListProps {
    activeCategory: string;
    priceSort: 'none' | 'high-low' | 'low-high';
}

export default function EquipmentList({ activeCategory, priceSort }: EquipmentListProps) {
    const [items, setItems] = useState<SportEquipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<SportEquipment | null>(null);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category_id: '',
        price: '',
        description: '',
        condition: 'New',
        image_filename: null as string | null,
        quantity: '0'
    });

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        }
    };

    const fetchItems = async () => {
        try {
            const response = await fetch('/api/equipment');
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/equipment?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
            setItems(prevItems => prevItems.filter(item => item.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete item');
        }
    };

    const handleEdit = (item: SportEquipment) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            brand: item.brand,
            category_id: item.category_id,
            price: item.price.toString(),
            description: item.description || '',
            condition: item.condition,
            image_filename: item.image_filename,
            quantity: item.quantity.toString()
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `/api/equipment?id=${editingItem.id}` : '/api/equipment';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    quantity: Number(formData.quantity)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save item');
            }

            await fetchItems();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save item');
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setEditingItem(null);
        setFormData({
            name: '',
            brand: '',
            category_id: '',
            price: '',
            description: '',
            condition: 'New',
            image_filename: null,
            quantity: '0'
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter and sort items
    const filteredAndSortedItems = items
        .filter(item => activeCategory === 'All' || item.category_name === activeCategory)
        .sort((a, b) => {
            const priceA = Number(a.price);
            const priceB = Number(b.price);
            if (priceSort === 'high-low') return priceB - priceA;
            if (priceSort === 'low-high') return priceA - priceB;
            return 0;
        });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add New Equipment
                </button>
            </div>

            {/* Modal Form */}
            {(showAddForm || editingItem) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                    <select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {editingItem ? 'Save Changes' : 'Add Equipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Equipment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredAndSortedItems.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg shadow-lg bg-white">
                        {item.image_filename && (
                            <img
                                src={`/images/equipment/${item.image_filename}`}
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">Brand: {item.brand}</p>
                        <p className="text-gray-600">Category: {item.category_name}</p>
                        <p className="text-gray-600">Price: ${Number(item.price).toFixed(2)}</p>
                        <p className="text-gray-600">Condition: {item.condition}</p>
                        <p className="text-gray-600">Stock: {item.quantity}</p>
                        {item.description && (
                            <p className="text-gray-600 mt-2">{item.description}</p>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => handleEdit(item)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 