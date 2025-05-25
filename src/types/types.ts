export interface SportEquipment {
    id: string;
    name: string;
    brand: string;
    category_id: string;
    category_name: string;
    price: number;
    description: string | null;
    condition: string;
    image_filename: string | null;
    quantity: number;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: string;
    name: string;
    created_at: Date;
}

export type SortField = 'name' | 'price' | 'category' | 'inStock';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
    categoryId?: string;
    sortOrder?: 'none' | 'high-low' | 'low-high';
} 