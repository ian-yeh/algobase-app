import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { casing: "snake_case" });

// Helper function to generate a random scramble (simplified)
function randomScramble(length = 20) {
  const moves = ["R", "R'", "R2", "U", "U'", "U2", "F", "F'", "F2", "L", "L'", "L2", "B", "B'", "B2", "D", "D'", "D2"];
  let scramble = [];
  for (let i = 0; i < length; i++) {
    scramble.push(moves[Math.floor(Math.random() * moves.length)]);
  }
  return scramble.join(" ");
}

const USER_ID = "4fd6c7da-930c-4abd-a5c4-be9004397cfd";

async function main() {
  console.log("🌱 Seeding `times` table with 1000 entries...");

  try {
    const timesData = Array.from({ length: 1000 }).map(() => ({
      userId: USER_ID,
      time: Math.floor(Math.random() * 30000) + 5000, // 5,000 → 35,000 centiseconds
      scramble: randomScramble(),
      dnf: Math.random() < 0.05, // 5% chance of DNF
      plusTwo: Math.random() < 0.1, // 10% chance of +2
    }));

    // Insert in batches for efficiency
    const batchSize = 100;
    for (let i = 0; i < timesData.length; i += batchSize) {
      const batch = timesData.slice(i, i + batchSize);
      await db.insert(schema.times).values(batch).onConflictDoNothing();
    }

    console.log("✅ Successfully seeded 1000 entries for userId:", USER_ID);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding `times` table:", error);
    process.exit(1);
  }
}

main();

