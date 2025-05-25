import { NextResponse } from 'next/server';
import { pool } from '@/scripts/config';

export async function GET() {
    const client = await pool.connect();
    
    try {
        // Use the materialized view for fast access to statistics
        const result = await client.query(`
            SELECT * FROM category_statistics
            ORDER BY total_items DESC;
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching category statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category statistics' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
} 