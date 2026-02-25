import {
  pgTable,
  text,
  varchar,
  numeric,
  vector,
  serial,
} from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 50 }),
  title: varchar("title", { length: 255 }),
  companyId: varchar("company_id", { length: 50 }),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  maxSalary: numeric("max_salary"),
  minSalary: numeric("min_salary"),
  workType: varchar("work_type", { length: 50 }),
  embedding: vector("embedding", { dimensions: 768 }),
});
