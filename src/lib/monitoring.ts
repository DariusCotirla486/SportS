import { sql } from '@vercel/postgres';
import { getConnection } from './db';

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
            WHERE created_at > ${timeWindow.toISOString()}
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

export interface SuspiciousUser {
  user_id: string;
  email: string;
  name: string;
  operation_count: number;
  last_operation: Date;
  reason: string;
}

export async function checkSuspiciousUsers(): Promise<SuspiciousUser[]> {
  const pool = await getConnection();
  
  // Find users with more than 2 operations in the last minute
  const result = await pool.query(`
    WITH recent_operations AS (
      SELECT 
        user_id,
        COUNT(*) as operation_count,
        MAX(created_at) as last_operation
      FROM operation_logs
      WHERE created_at > NOW() - INTERVAL '1 minute'
      GROUP BY user_id
      HAVING COUNT(*) >= 2
    )
    SELECT 
      ro.user_id,
      u.email,
      u.name,
      ro.operation_count,
      ro.last_operation,
      'Multiple operations in short time' as reason
    FROM recent_operations ro
    JOIN users u ON ro.user_id = u.id
    LEFT JOIN monitored_users mu ON ro.user_id = mu.user_id
    WHERE mu.id IS NULL
  `);

  // Add suspicious users to monitored_users table
  for (const user of result.rows) {
    await pool.query(`
      INSERT INTO monitored_users (user_id, reason)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO NOTHING
    `, [user.user_id, user.reason]);
  }

  return result.rows;
}

// Function to get all monitored users
export async function getMonitoredUsers() {
  const pool = await getConnection();
  const result = await pool.query(`
    SELECT 
      mu.id,
      mu.user_id,
      mu.reason,
      mu.created_at,
      u.email,
      u.name
    FROM monitored_users mu
    JOIN users u ON mu.user_id = u.id
    ORDER BY mu.created_at DESC
  `);
  return result.rows;
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