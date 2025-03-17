import { createContext, useContext, useReducer, ReactNode } from 'react';
import { SportEquipment, FilterOptions, SortField, SortOrder } from '../types/types';

interface State {
  equipment: SportEquipment[];
  filterOptions: FilterOptions;
  sortField: SortField;
  sortOrder: SortOrder;
}

type Action =
  | { type: 'ADD_EQUIPMENT'; payload: Omit<SportEquipment, 'id'> }
  | { type: 'UPDATE_EQUIPMENT'; payload: { id: string; data: Partial<SportEquipment> } }
  | { type: 'DELETE_EQUIPMENT'; payload: string }
  | { type: 'SET_FILTER'; payload: FilterOptions }
  | { type: 'SET_SORT'; payload: { field: SortField; order: SortOrder } };

const initialState: State = {
  equipment: [
    {
      id: '1',
      name: 'Professional Basketball',
      category: 'Ball Sports',
      price: 29.99,
      brand: 'SportsPro',
      inStock: 5,
      description: 'Official size and weight basketball, perfect for indoor and outdoor play',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/orange/white?text=Basketball'
    },
    {
      id: '2',
      name: 'Premium Soccer Ball',
      category: 'Ball Sports',
      price: 24.99,
      brand: 'KickMaster',
      inStock: 20,
      description: 'Size 5 soccer ball, competition grade with enhanced durability',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/black/white?text=Soccer+Ball'
    },
    {
      id: '3',
      name: 'Pro Soccer Cleats',
      category: 'Team Sports',
      price: 89.99,
      brand: 'SpeedKicks',
      inStock: 8,
      description: 'Lightweight soccer cleats with superior grip and comfort',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/gray/white?text=Soccer+Cleats'
    },
    {
      id: '4',
      name: 'Tennis Racket Pro',
      category: 'Ball Sports',
      price: 159.99,
      brand: 'SwingMaster',
      inStock: 5,
      description: 'Professional grade tennis racket with carbon fiber frame',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/green/white?text=Tennis+Racket'
    },
    {
      id: '5',
      name: 'Football Training Set',
      category: 'Team Sports',
      price: 49.99,
      brand: 'GridIron',
      inStock: 15,
      description: 'Complete football training set with cones and agility ladder',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/brown/white?text=Football+Set'
    },
    {
      id: '6',
      name: 'Basketball Hoop System',
      category: 'Ball Sports',
      price: 299.99,
      brand: 'HoopMaster',
      inStock: 3,
      description: 'Adjustable height basketball hoop with heavy-duty backboard',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/blue/white?text=Basketball+Hoop'
    },
    {
      id: '7',
      name: 'Tennis Ball Set',
      category: 'Ball Sports',
      price: 19.99,
      brand: 'CourtKing',
      inStock: 25,
      description: 'Set of 4 premium tennis balls for all court types',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/yellow/white?text=Tennis+Balls'
    },
    {
      id: '8',
      name: 'Training Agility Ladder',
      category: 'Training',
      price: 34.99,
      brand: 'SpeedPro',
      inStock: 12,
      description: 'Professional agility ladder for sports training',
      condition: 'New',
      imageUrl: 'https://placehold.co/400x400/red/white?text=Agility+Ladder'
    }
  ],
  filterOptions: {},
  sortField: 'name',
  sortOrder: 'asc',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_EQUIPMENT':
      return {
        ...state,
        equipment: [
          ...state.equipment,
          { ...action.payload, id: Math.random().toString(36).substring(2, 9) },
        ],
      };
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.data }
            : item
        ),
      };
    case 'DELETE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.filter((item) => item.id !== action.payload),
      };
    case 'SET_FILTER':
      return {
        ...state,
        filterOptions: action.payload,
      };
    case 'SET_SORT':
      return {
        ...state,
        sortField: action.payload.field,
        sortOrder: action.payload.order,
      };
    default:
      return state;
  }
}

const EquipmentContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <EquipmentContext.Provider value={{ state, dispatch }}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
} 