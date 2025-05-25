import { faker } from '@faker-js/faker';
import { pool } from '../config';

// Function to add or update stock
async function addStock(item_id: string, quantity: number): Promise<void> {
    // First check if stock exists
    const checkResult = await pool.query(
        'SELECT id FROM item_stock WHERE item_id = $1',
        [item_id]
    );

    if (checkResult.rows.length > 0) {
        // Update existing stock
        await pool.query(
            'UPDATE item_stock SET quantity = $1, last_updated = NOW() WHERE item_id = $2',
            [quantity, item_id]
        );
    } else {
        // Insert new stock
        await pool.query(
            'INSERT INTO item_stock (item_id, quantity) VALUES ($1, $2)',
            [item_id, quantity]
        );
    }
}

async function generateStock() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        console.log('Fetching items...');
        const items = await client.query('SELECT id FROM items');
        console.log(`Found ${items.rows.length} items`);
        
        console.log('Generating stock entries...');
        let stockEntriesGenerated = 0;
        
        // Generate stock for each item
        for (const item of items.rows) {
            const quantity = faker.number.int({ min: 0, max: 100 });
            await addStock(item.id, quantity);
            
            stockEntriesGenerated++;
            
            // Log progress every 1000 entries
            if (stockEntriesGenerated % 1000 === 0) {
                console.log(`Generated ${stockEntriesGenerated} stock entries...`);
            }
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Stock generation completed successfully!');
        console.log(`Generated ${stockEntriesGenerated} stock entries`);

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error generating stock entries:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the generator
generateStock()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 