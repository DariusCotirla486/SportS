import { faker } from '@faker-js/faker';
import { pool } from '../config';

// Categories to generate
const CATEGORIES_COUNT = 100000;

// Function to generate a unique category name
function generateUniqueCategoryName(index: number): string {
    const department = faker.commerce.department();
    const randomNum = faker.number.int({ min: 1, max: 999999 });
    return `${department} ${index}-${randomNum}`;
}

// Function to add a category
async function addCategory(name: string): Promise<string> {
    const result = await pool.query(
        'INSERT INTO item_categories (name) VALUES ($1) RETURNING id',
        [name]
    );
    return result.rows[0].id;
}

async function generateCategories() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');

        console.log('Generating categories...');
        const categoryIds: string[] = [];
        
        // Generate categories
        for (let i = 0; i < CATEGORIES_COUNT; i++) {
            const categoryName = generateUniqueCategoryName(i);
            const categoryId = await addCategory(categoryName);
            categoryIds.push(categoryId);
            
            // Log progress every 1000 categories
            if ((i + 1) % 1000 === 0) {
                console.log(`Generated ${i + 1} categories...`);
            }
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Category generation completed successfully!');
        console.log(`Generated ${CATEGORIES_COUNT} categories`);

    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error generating categories:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the generator
generateCategories()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 