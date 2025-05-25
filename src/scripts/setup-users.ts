const { getConnection } = require('../lib/db');
const bcrypt = require('bcryptjs');

async function setupUsers() {
    try {
        console.log('Setting up users...');
        const pool = await getConnection();

        // First, ensure we have the roles
        await pool.query(`
            INSERT INTO user_roles (id, name) 
            VALUES 
                ('11111111-1111-1111-1111-111111111111', 'admin'),
                ('22222222-2222-2222-2222-222222222222', 'user')
            ON CONFLICT (name) DO NOTHING
        `);

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const testPassword = await bcrypt.hash('test123', 10);

        // Get role IDs
        const adminRole = await pool.query("SELECT id FROM user_roles WHERE name = 'admin'");
        const userRole = await pool.query("SELECT id FROM user_roles WHERE name = 'user'");

        // Update or insert admin user
        await pool.query(`
            INSERT INTO users (id, email, password_hash, name, role_id)
            VALUES (
                '123e4567-e89b-12d3-a456-426614174000',
                'admin@example.com',
                $1,
                'Admin User',
                $2
            )
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = $1,
                role_id = $2
        `, [adminPassword, adminRole.rows[0].id]);

        // Update or insert test user
        await pool.query(`
            INSERT INTO users (id, email, password_hash, name, role_id)
            VALUES (
                '123e4567-e89b-12d3-a456-426614174100',
                'test@example.com',
                $1,
                'Test User',
                $2
            )
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = $1,
                role_id = $2
        `, [testPassword, userRole.rows[0].id]);

        console.log('Users setup completed!');
        console.log('\nTest credentials:');
        console.log('Admin:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');
        console.log('\nTest User:');
        console.log('  Email: test@example.com');
        console.log('  Password: test123');

    } catch (error) {
        console.error('Error setting up users:', error);
        process.exit(1);
    }
}

// Run the setup
setupUsers().catch(console.error); 