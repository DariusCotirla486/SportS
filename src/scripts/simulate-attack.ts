import { sql } from '@vercel/postgres';
import { logOperation } from '../lib/monitoring';

// Configuration
const ATTACK_USER_ID = '123e4567-e89b-12d3-a456-426614174100'; // Use the test user ID
const OPERATIONS_PER_BATCH = 20;
const TOTAL_BATCHES = 3;
const DELAY_BETWEEN_BATCHES = 1000; // 1 second

async function simulateAttack() {
    console.log('Starting attack simulation...');
    
    try {
        // Verify user exists
        const userCheck = await sql`
            SELECT id FROM users WHERE id = ${ATTACK_USER_ID}
        `;
        
        if (userCheck.rows.length === 0) {
            console.error('Test user not found. Please create the test user first.');
            process.exit(1);
        }

        // Simulate multiple batches of operations
        for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
            console.log(`Executing batch ${batch + 1}/${TOTAL_BATCHES}...`);
            
            // Create multiple items in parallel
            const operations = Array(OPERATIONS_PER_BATCH).fill(null).map(async (_, index) => {
                const itemName = `Test Item ${batch}-${index}`;
                
                // Log a CREATE operation
                await logOperation(
                    ATTACK_USER_ID,
                    'CREATE',
                    'item',
                    undefined,
                    { name: itemName, batch, index }
                );
                
                // Log a READ operation
                await logOperation(
                    ATTACK_USER_ID,
                    'READ',
                    'item',
                    undefined,
                    { name: itemName, batch, index }
                );
                
                // Log an UPDATE operation
                await logOperation(
                    ATTACK_USER_ID,
                    'UPDATE',
                    'item',
                    undefined,
                    { name: itemName, batch, index }
                );
                
                // Log a DELETE operation
                await logOperation(
                    ATTACK_USER_ID,
                    'DELETE',
                    'item',
                    undefined,
                    { name: itemName, batch, index }
                );
            });
            
            // Wait for all operations in this batch to complete
            await Promise.all(operations);
            
            // Wait before next batch
            if (batch < TOTAL_BATCHES - 1) {
                console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }
        
        console.log('Attack simulation completed!');
        console.log(`Total operations performed: ${OPERATIONS_PER_BATCH * TOTAL_BATCHES * 4}`); // 4 operations per item
        console.log('Check the admin dashboard to see if the user was flagged as suspicious.');
        
    } catch (error) {
        console.error('Error during attack simulation:', error);
        process.exit(1);
    }
}

// Run the simulation
simulateAttack().catch(console.error); 