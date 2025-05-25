import { pool } from '../config';

async function cleanupItems() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        console.log('Cleaning up items...');
        
        // Keep only 10 items
        const result = await client.query(`
            DELETE FROM items 
            WHERE id NOT IN (
                SELECT id FROM items 
                ORDER BY id 
                LIMIT 10
            )
            RETURNING id
        `);
        
        // Commit transaction
        await client.query('COMMIT');
        console.log('Item cleanup completed successfully!');
        console.log(`Kept 10 items, deleted ${result.rowCount} items`);

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error cleaning up items:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the cleanup
cleanupItems()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 