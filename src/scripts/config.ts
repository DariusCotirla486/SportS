import { Pool } from 'pg';

export const config = {
    user: 'postgres',
    password: 'darius',
    host: 'localhost',
    database: 'EquipmentStore',
    port: 5432,
};

export const pool = new Pool(config); 