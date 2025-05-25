import { faker } from '@faker-js/faker';
import { pool } from '../config';

// Items to generate per category
const ITEMS_PER_CATEGORY = 2;

// Function to add an item
async function addItem(
    name: string,
    brand: string,
    category_id: string,
    price: number,
    description: string | null,
    condition: string,
    image_filename: string | null
): Promise<string> {
    const result = await pool.query(
        'SELECT add_item($1, $2, $3, $4, $5, $6, $7) as id',
        [name, brand, category_id, price, description, condition, image_filename]
    );
    return result.rows[0].id;
}

async function generateItems() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        console.log('Fetching categories...');
        const categories = await client.query('SELECT id FROM item_categories');
        console.log(`Found ${categories.rows.length} categories`);
        
        console.log('Generating items...');
        let itemsGenerated = 0;
        
        // Generate items for each category
        for (const category of categories.rows) {
            for (let i = 0; i < ITEMS_PER_CATEGORY; i++) {
                const item = {
                    name: faker.commerce.productName(),
                    brand: faker.company.name(),
                    category_id: category.id,
                    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
                    description: faker.commerce.productDescription(),
                    condition: faker.helpers.arrayElement(['New', 'Like New', 'Good', 'Fair', 'Poor']),
                    image_filename: faker.image.url()
                };

                // Add item
                await addItem(
                    item.name,
                    item.brand,
                    item.category_id,
                    item.price,
                    item.description,
                    item.condition,
                    item.image_filename
                );
                
                itemsGenerated++;
                
                // Log progress every 1000 items
                if (itemsGenerated % 1000 === 0) {
                    console.log(`Generated ${itemsGenerated} items...`);
                }
            }
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Item generation completed successfully!');
        console.log(`Generated ${itemsGenerated} items`);

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error generating items:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the generator
generateItems()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 