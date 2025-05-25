'use client';

import { useState } from 'react';
import { SportEquipment } from '@/types/types';
import { useEquipment } from '@/hooks/useEquipment';
import EquipmentForm from './EquipmentForm';

interface EquipmentListProps {
    activeCategoryId: string | null;
    priceSort: 'none' | 'high-low' | 'low-high';
}

export default function EquipmentList({ activeCategoryId, priceSort }: EquipmentListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingEquipment, setEditingEquipment] = useState<SportEquipment | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const itemsPerPage = 8;
    const { equipment, loading, error, deleteEquipment, updateEquipment, addEquipment } = useEquipment();

    // Filter and sort equipment
    const filteredAndSortedEquipment = equipment
        .filter(item => !activeCategoryId || item.category_id === activeCategoryId)
        .sort((a, b) => {
            if (priceSort === 'high-low') return b.price - a.price;
            if (priceSort === 'low-high') return a.price - b.price;
            return 0;
        });

    const handleDelete = async (id: string) => {
        try {
            await deleteEquipment(id);
        } catch (error) {
            console.error('Error deleting equipment:', error);
        }
    };

    const handleEdit = (equipment: SportEquipment) => {
        setEditingEquipment(equipment);
        setIsFormOpen(true);
    };

    const handleUpdate = async (updatedEquipment: SportEquipment) => {
        try {
            await updateEquipment(updatedEquipment.id, updatedEquipment);
            setEditingEquipment(undefined);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error updating equipment:', error);
        }
    };

    const handleAddNew = () => {
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingEquipment(undefined);
    };

    const handleFormSubmit = async (newEquipment: SportEquipment) => {
        try {
            if (editingEquipment) {
                await handleUpdate(newEquipment);
            } else {
                await addEquipment(newEquipment);
            }
            handleFormClose();
        } catch (error) {
            console.error('Error handling equipment:', error);
        }
    };

    // If form is open, only show the form
    if (isFormOpen || editingEquipment) {
        return (
            <div className="fixed inset-0 bg-white z-50">
                <EquipmentForm
                    onClose={handleFormClose}
                    equipment={editingEquipment}
                    onUpdate={handleFormSubmit}
                />
            </div>
        );
    }

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading equipment...</div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-red-600">Error: {error}</div>
            </div>
        );
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredAndSortedEquipment.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEquipment = filteredAndSortedEquipment.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add New Equipment
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedEquipment.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-48">
                            <img
                                src={item.image_filename || '/placeholder.png'}
                                alt={item.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.brand}</p>
                            <p className="text-lg font-bold text-blue-600 mt-2">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 mt-1">In Stock: {item.quantity}</p>
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-700">Page</span>
                    <span className="font-semibold text-blue-600">{currentPage}</span>
                    <span className="text-gray-700">of</span>
                    <span className="font-semibold text-blue-600">{totalPages}</span>
                </div>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
} 