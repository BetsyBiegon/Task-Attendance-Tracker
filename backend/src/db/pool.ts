import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// A Pool manages multiple database connections efficiently.
// Instead of opening and closing a connection on every request,
// the pool keeps connections alive and reuses them.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to PostgreSQL database');
    release(); // return the connection back to the pool
  }
});

export default pool;
