export interface SportEquipment {
    id: string;
    name: string;
    category: 'Ball Sports' | 'Team Sports' | 'Training' | 'Accessories';
    price: number;
    brand: string;
    inStock: number;
    description: string;
    condition: 'New' | 'Used' | 'Refurbished';
    imageUrl?: string;
  }
  
  export type SortField = 'name' | 'price' | 'category' | 'inStock';
  export type SortOrder = 'asc' | 'desc';
  
  export interface FilterOptions {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    searchQuery?: string;
  } 