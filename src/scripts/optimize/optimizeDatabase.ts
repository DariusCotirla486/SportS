import { pool } from '../config';

async function optimizeDatabase() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Starting database optimization...');

        // Add indices for frequently queried columns
        console.log('Adding indices...');
        
        // Index for categories (name is frequently used in searches)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_categories_name 
            ON item_categories (name);
        `);

        // Index for items (name and category_id are frequently used)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_items_name 
            ON items (name);
            
            CREATE INDEX IF NOT EXISTS idx_items_category 
            ON items (category_id);
        `);

        // Index for stock entries (item_id and quantity are frequently used)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_stock_item 
            ON item_stock (item_id);
            
            CREATE INDEX IF NOT EXISTS idx_stock_quantity 
            ON item_stock (quantity);
        `);

        // Create a materialized view for category statistics
        console.log('Creating materialized view for category statistics...');
        await client.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS category_statistics AS
            SELECT 
                c.id as category_id,
                c.name as category_name,
                COUNT(i.id) as total_items,
                SUM(s.quantity) as total_stock,
                AVG(s.quantity) as avg_stock,
                MIN(s.quantity) as min_stock,
                MAX(s.quantity) as max_stock
            FROM item_categories c
            LEFT JOIN items i ON c.id = i.category_id
            LEFT JOIN item_stock s ON i.id = s.item_id
            GROUP BY c.id, c.name
            WITH DATA;
        `);

        // Create index on the materialized view
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_category_statistics_id 
            ON category_statistics (category_id);
        `);

        // Create a function to refresh the materialized view
        await client.query(`
            CREATE OR REPLACE FUNCTION refresh_category_statistics()
            RETURNS TRIGGER AS $$
            BEGIN
                REFRESH MATERIALIZED VIEW CONCURRENTLY category_statistics;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create triggers to refresh the materialized view
        await client.query(`
            DROP TRIGGER IF EXISTS refresh_category_statistics_trigger ON items;
            CREATE TRIGGER refresh_category_statistics_trigger
            AFTER INSERT OR UPDATE OR DELETE ON items
            FOR EACH STATEMENT
            EXECUTE FUNCTION refresh_category_statistics();

            DROP TRIGGER IF EXISTS refresh_category_statistics_trigger_stock ON item_stock;
            CREATE TRIGGER refresh_category_statistics_trigger_stock
            AFTER INSERT OR UPDATE OR DELETE ON item_stock
            FOR EACH STATEMENT
            EXECUTE FUNCTION refresh_category_statistics();
        `);

        await client.query('COMMIT');
        console.log('Database optimization completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error optimizing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the optimization
optimizeDatabase()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 