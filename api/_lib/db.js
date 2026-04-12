import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing database connection string.");
  }

  return neon(connectionString);
}
