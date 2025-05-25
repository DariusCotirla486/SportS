const { getConnection } = require('../lib/db');

async function fixTestUser() {
    try {
        console.log('Fixing test user role...');
        const pool = await getConnection();

        // Get the user role ID
        const roleResult = await pool.query(
            "SELECT id FROM user_roles WHERE name = 'user'"
        );
        
        if (!roleResult.rows[0]) {
            console.error('User role not found!');
            return;
        }

        const userRoleId = roleResult.rows[0].id;

        // Update the test user's role
        const result = await pool.query(
            `UPDATE users 
             SET role_id = $1 
             WHERE email = 'test@example.com' 
             RETURNING id, email, role_id`,
            [userRoleId]
        );

        if (result.rows[0]) {
            console.log('Test user updated successfully:', result.rows[0]);
        } else {
            console.log('Test user not found!');
        }

    } catch (error) {
        console.error('Error fixing test user:', error);
    }
}

// Run the fix
fixTestUser().catch(console.error); 