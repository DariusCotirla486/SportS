import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    password: 'darius',
    host: 'localhost',
    database: 'EquipmentStore',
    port: 5432,
});

// Add error handler to the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Export a function to get the pool
export async function getConnection() {
    return pool;
}

module.exports = {
    getConnection,
    pool
};

// The following is just for reference and not used in the backend logic
// If you need these types/arrays, move them to a separate file or convert to CommonJS
// export interface SportEquipment { ... }
// export const equipment: SportEquipment[] = [ ... ]; 