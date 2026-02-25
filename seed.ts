import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { jobs } from "./schema";
import fs from "fs";
import csv from "csv-parser";
import ollama from "ollama";
import * as dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  const rows: any[] = [];

  console.log("Reading CSV file");

  fs.createReadStream("job_postings.csv")
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      console.log(`Processing ${rows.length} jobs`);

      for (const row of rows) {
        try {
          // 1. Generate the Embedding (The "AI Meaning")
          const response = await ollama.embeddings({
            model: "nomic-embed-text",
            prompt: row.description, // We vectorize the description
          });

          const embedding = response.embedding;

          // 2. Insert into Postgres
          await db.insert(jobs).values({
            jobId: row.job_id,
            title: row.title,
            companyId: row.company_id,
            description: row.description,
            location: row.location,
            maxSalary: row.max_salary ? row.max_salary : null,
            minSalary: row.min_salary ? row.min_salary : null,
            workType: row.work_type,
            embedding: embedding,
          });

          console.log(`Saved: ${row.title}`);
        } catch (err) {
          console.error(`Skipped ${row.title}:`, err);
        }
      }

      console.log("\nDatabase successfully seeded");
      process.exit(0);
    });
}

seed();
