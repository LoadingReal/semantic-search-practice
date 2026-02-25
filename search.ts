import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { jobs } from "./schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import ollama from "ollama";
import * as dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function searchJobs(query: string) {
  console.log("\n" + "=".repeat(50));
  console.log(`SEARCHING FOR: "${query}"`);
  console.log("=".repeat(50) + "\n");

  const response = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: query,
  });
  const queryVector = response.embedding;

  const similarity = sql<number>`1 - (${cosineDistance(jobs.embedding, queryVector)})`;

  const results = await db
    .select({
      title: jobs.title,
      description: jobs.description,
      location: jobs.location,
      similarity: similarity,
    })
    .from(jobs)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(20);

  if (results.length === 0) {
    console.log("No matching jobs found.");
    return;
  }

  results.forEach((job, i) => {
    const score = (job.similarity * 100).toFixed(1);
    const cleanTitle = job.title?.toUpperCase() || "UNTITLED ROLE";

    console.log(`[${i + 1}] ${cleanTitle}`);
    console.log(`Location: ${job.location || "Not Specified"}`);
    console.log(`Match Score: ${score}%`);

    const preview = job.description
      ? job.description.replace(/\n/g, " ").substring(0, 150) + "..."
      : "No description available.";

    console.log(`📝 Preview: ${preview}`);
    console.log("-".repeat(40));
  });

  console.log(`\nShowing top ${results.length} matches.\n`);
}

const userQuery = process.argv[2] || "Remote React developer";
searchJobs(userQuery);
