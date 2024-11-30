
import { Pool } from "pg";

const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "diagnostics",
  password: "password",
  port: 5433,
});

export async function connectToDatabase(): Promise<any> {
  return pool;
}
