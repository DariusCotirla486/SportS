import { sql } from '@vercel/postgres';

// Constants for monitoring
const SUSPICIOUS_OPERATIONS_THRESHOLD = 50; // Number of operations
const SUSPICIOUS_TIME_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

// Log an operation
export async function logOperation(
    userId: string,
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId?: string,
    details?: any
) {
    try {
        await sql`
            INSERT INTO operation_logs (user_id, action, entity_type, entity_id, details)
            VALUES (${userId}, ${action}, ${entityType}, ${entityId}, ${JSON.stringify(details)})
        `;
    } catch (error) {
        console.error('Error logging operation:', error);
    }
}

// Check for suspicious activity
export async function checkSuspiciousActivity() {
    try {
        const timeWindow = new Date(Date.now() - SUSPICIOUS_TIME_WINDOW);
        
        // Get users with high operation counts
        const result = await sql`
            SELECT 
                user_id,
                COUNT(*) as operation_count
            FROM operation_logs
            WHERE created_at > ${timeWindow}
            GROUP BY user_id
            HAVING COUNT(*) > ${SUSPICIOUS_OPERATIONS_THRESHOLD}
        `;

        // Add suspicious users to monitored list
        for (const row of result.rows) {
            await sql`
                INSERT INTO monitored_users (user_id, reason)
                VALUES (${row.user_id}, 'High operation frequency detected')
                ON CONFLICT (user_id) DO NOTHING
            `;
        }
    } catch (error) {
        console.error('Error checking suspicious activity:', error);
    }
}

// Get monitored users
export async function getMonitoredUsers() {
    try {
        const result = await sql`
            SELECT 
                m.*,
                u.email,
                u.name
            FROM monitored_users m
            JOIN users u ON u.id = m.user_id
            ORDER BY m.created_at DESC
        `;
        return result.rows;
    } catch (error) {
        console.error('Error getting monitored users:', error);
        return [];
    }
}

// Check if user is monitored
export async function isUserMonitored(userId: string): Promise<boolean> {
    try {
        const result = await sql`
            SELECT 1 FROM monitored_users WHERE user_id = ${userId}
        `;
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking if user is monitored:', error);
        return false;
    }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
    try {
        const result = await sql`
            SELECT 1 
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            WHERE u.id = ${userId} AND r.name = 'admin'
        `;
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking if user is admin:', error);
        return false;
    }
} 