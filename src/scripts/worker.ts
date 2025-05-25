import { parentPort } from 'node:worker_threads';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

const config = {
    user: 'postgres',
    password: 'darius',
    host: 'localhost',
    database: 'EquipmentStore',
    port: 5432,
};

const pool = new Pool(config);

async function cleanupCategories() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Cleaning up categories...');
        
        await client.query(`
            DELETE FROM item_categories 
            WHERE id NOT IN (
                SELECT id FROM item_categories 
                ORDER BY id 
                LIMIT 5
            )
        `);
        
        await client.query('ALTER SEQUENCE item_categories_id_seq RESTART WITH 1');
        await client.query('COMMIT');
        
        parentPort?.postMessage({ success: true, message: 'Kept 5 categories' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        parentPort?.postMessage({ success: false, error: error?.message || 'Unknown error' });
    } finally {
        client.release();
    }
}

async function cleanupItems() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Cleaning up items...');
        
        await client.query(`
            DELETE FROM items 
            WHERE id NOT IN (
                SELECT id FROM items 
                ORDER BY id 
                LIMIT 10
            )
        `);
        
        await client.query('ALTER SEQUENCE items_id_seq RESTART WITH 1');
        await client.query('COMMIT');
        
        parentPort?.postMessage({ success: true, message: 'Kept 10 items' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        parentPort?.postMessage({ success: false, error: error?.message || 'Unknown error' });
    } finally {
        client.release();
    }
}

async function cleanupStock() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Cleaning up stock entries...');
        
        await client.query(`
            DELETE FROM item_stock 
            WHERE id NOT IN (
                SELECT id FROM item_stock 
                ORDER BY id 
                LIMIT 10
            )
        `);
        
        await client.query('ALTER SEQUENCE item_stock_id_seq RESTART WITH 1');
        await client.query('COMMIT');
        
        parentPort?.postMessage({ success: true, message: 'Kept 10 stock entries' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        parentPort?.postMessage({ success: false, error: error?.message || 'Unknown error' });
    } finally {
        client.release();
    }
}

// Listen for messages from the main thread
parentPort?.on('message', async (message) => {
    switch (message.type) {
        case 'cleanupCategories':
            await cleanupCategories();
            break;
        case 'cleanupItems':
            await cleanupItems();
            break;
        case 'cleanupStock':
            await cleanupStock();
            break;
        default:
            parentPort?.postMessage({ success: false, error: 'Unknown operation' });
    }
}); 