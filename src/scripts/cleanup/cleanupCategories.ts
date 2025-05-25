import { pool } from '../config';

async function cleanupCategories() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        console.log('Cleaning up categories...');
        
        // First, get the IDs of the categories we want to keep
        const keepCategories = await client.query(`
            SELECT id FROM item_categories 
            ORDER BY id 
            LIMIT 5
        `);
        
        const keepCategoryIds = keepCategories.rows.map(row => row.id);
        
        // Update items to reference only the categories we're keeping
        // If an item references a category we're deleting, assign it to the first kept category
        const updateResult = await client.query(`
            UPDATE items 
            SET category_id = $1
            WHERE category_id NOT IN (${keepCategoryIds.map((_, i) => `$${i + 2}`).join(',')})
        `, [keepCategoryIds[0], ...keepCategoryIds]);
        
        console.log(`Updated ${updateResult.rowCount} items to reference kept categories`);
        
        // Now we can safely delete the other categories
        const deleteResult = await client.query(`
            DELETE FROM item_categories 
            WHERE id NOT IN (${keepCategoryIds.map((_, i) => `$${i + 1}`).join(',')})
            RETURNING id
        `, keepCategoryIds);
        
        // Commit transaction
        await client.query('COMMIT');
        console.log('Category cleanup completed successfully!');
        console.log(`Kept ${keepCategoryIds.length} categories, deleted ${deleteResult.rowCount} categories`);

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error cleaning up categories:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the cleanup
cleanupCategories()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 