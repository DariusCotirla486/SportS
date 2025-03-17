'use client';

import { useEquipment } from '../context/EquipmentContext';
import { FilterOptions, SortField, SortOrder } from '../types/types';

export default function FilterSort() {
  const { state, dispatch } = useEquipment();

  const handleFilterChange = (filterOptions: Partial<FilterOptions>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { ...state.filterOptions, ...filterOptions },
    });
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    dispatch({
      type: 'SET_SORT',
      payload: { field, order },
    });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <select
          value={state.filterOptions.category || ''}
          onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
          className="border rounded-lg p-2"
        >
          <option value="">All Categories</option>
          <option value="Ball Sports">Ball Sports</option>
          <option value="Fitness">Fitness</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Team Sports">Team Sports</option>
          <option value="Water Sports">Water Sports</option>
        </select>

        {/* Condition Filter */}
        <select
          value={state.filterOptions.condition || ''}
          onChange={(e) => handleFilterChange({ condition: e.target.value || undefined })}
          className="border rounded-lg p-2"
        >
          <option value="">All Conditions</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
          <option value="Refurbished">Refurbished</option>
        </select>

        {/* Price Range Filters */}
        <input
          type="number"
          placeholder="Min Price"
          value={state.filterOptions.minPrice || ''}
          onChange={(e) =>
            handleFilterChange({
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="border rounded-lg p-2"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={state.filterOptions.maxPrice || ''}
          onChange={(e) =>
            handleFilterChange({
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="border rounded-lg p-2"
        />
      </div>

      <div className="flex gap-4 items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search equipment..."
          value={state.filterOptions.searchQuery || ''}
          onChange={(e) =>
            handleFilterChange({ searchQuery: e.target.value || undefined })
          }
          className="border rounded-lg p-2 flex-grow"
        />

        {/* Sort Controls */}
        <select
          value={state.sortField}
          onChange={(e) => handleSortChange(e.target.value as SortField, state.sortOrder)}
          className="border rounded-lg p-2"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="category">Category</option>
          <option value="inStock">Stock</option>
        </select>

        <button
          onClick={() =>
            handleSortChange(
              state.sortField,
              state.sortOrder === 'asc' ? 'desc' : 'asc'
            )
          }
          className="border rounded-lg p-2 px-4"
        >
          {state.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
} 