import { Pool, PoolClient } from 'pg';
import { getDatabaseURLWithSSL } from './config';

export type { PoolClient };

let pool: Pool | null = null;

export const initializePool = (): Pool => {
  if (pool) {
    return pool;
  }

  const connectionString = getDatabaseURLWithSSL();

  pool = new Pool({
    connectionString,
    // SSL configuration
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
};

export const getConnection = async (): Promise<PoolClient> => {
  const pool = initializePool();
  return pool.connect();
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const pool = initializePool();
  return pool.query(text, params);
};

export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export default pool;
