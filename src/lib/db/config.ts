// Database configuration for PostgreSQL
// Usage: Import and use in environment variables or connection strings

export const dbConfig = {
  // Connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'african_agent',
  
  // Connection pool settings
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Logging
  logging: process.env.DB_LOGGING === 'true',
};

export const getDatabaseURL = (): string => {
  const { host, port, username, password, database } = dbConfig;
  return `postgresql://${username}:${password}@${host}:${port}/${database}`;
};

// Connection string with SSL option
export const getDatabaseURLWithSSL = (): string => {
  const url = getDatabaseURL();
  if (process.env.DB_SSL === 'true') {
    return url + '?sslmode=require';
  }
  return url;
};

export default dbConfig;
