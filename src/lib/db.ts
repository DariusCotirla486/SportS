import { Pool } from 'pg';

const config = {
    user: 'postgres',
    password: 'darius', // Replace with your actual password
    host: 'localhost',
    database: 'EquipmentStore',
    port: 5432,
};

// Create a connection pool
const pool = new Pool(config);

// Add error handler to the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Export a function to get the pool
export async function getConnection() {
    try {
        // Test the connection
        const client = await pool.connect();
        client.release();
        return pool;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw new Error('Failed to connect to the database. Please check if PostgreSQL is running and the credentials are correct.');
    }
}

export interface SportEquipment {
    id: string;
    name: string;
    category: string;
    price: number;
    brand: string;
    inStock: number;
    description: string;
    condition: string;
    imageUrl: string;
}

export const equipment: SportEquipment[] = [
    {
        id: '1',
        name: 'Professional Basketball',
        category: 'Basketball',
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
        category: 'Football/Soccer',
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
        category: 'Football/Soccer',
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
        category: 'Tennis',
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
        category: 'Football/Soccer',
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
        category: 'Basketball',
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
        category: 'Tennis',
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
    },
    {
        id: '9',
        name: 'Basketball Training Kit',
        category: 'Basketball',
        price: 79.99,
        brand: 'HoopMaster',
        inStock: 7,
        description: 'Complete basketball training kit with ball, pump, and accessories',
        condition: 'New',
        imageUrl: 'https://placehold.co/400x400/orange/white?text=Basketball+Kit'
    },
    {
        id: '10',
        name: 'Tennis Court Net',
        category: 'Tennis',
        price: 129.99,
        brand: 'CourtKing',
        inStock: 4,
        description: 'Professional tennis net with heavy-duty construction',
        condition: 'New',
        imageUrl: 'https://placehold.co/400x400/white/black?text=Tennis+Net'
    }
]; 