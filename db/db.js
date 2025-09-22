import env from "dotenv";
import pg from "pg";

env.config();

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // important for Neon
});

db.connect();

db.on("error", (err) => {
  console.error("Unexpected error while connecting db", err);
  process.exit(-1);
});

export const query = (text, params) => db.query(text, params);
