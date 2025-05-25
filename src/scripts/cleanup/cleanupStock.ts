import { pool } from '../config';

async function cleanupStock() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        console.log('Cleaning up stock entries...');
        
        // Keep only 10 stock entries
        const result = await client.query(`
            DELETE FROM item_stock 
            WHERE id NOT IN (
                SELECT id FROM item_stock 
                ORDER BY id 
                LIMIT 10
            )
            RETURNING id
        `);
        
        // Commit transaction
        await client.query('COMMIT');
        console.log('Stock cleanup completed successfully!');
        console.log(`Kept 10 stock entries, deleted ${result.rowCount} entries`);

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error cleaning up stock entries:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the cleanup
cleanupStock()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 