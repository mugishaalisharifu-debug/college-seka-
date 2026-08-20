import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

export const dbProvider = {
  provide: DRIZZLE,
  useFactory: () => {
    const connectionString = process.env.DB_URL;

    if (!connectionString) {
      throw new Error('DATABASE URL is missing');
    }
    const pool = new Pool({ connectionString });
    return drizzle(pool, { schema });
  },
};
