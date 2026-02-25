import fs from "fs";
import csv from "csv-parser";

const filePath = "job_postings.csv";
let rowCount = 0;

console.log("--- Peeking at the first 5 rows ---");

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (row) => {
    if (rowCount < 5) {
      console.log(`Row ${rowCount + 1}:`, row);
      rowCount++;
    } else {
      process.exit(0);
    }
  })
  .on("error", (err) => {
    console.error("Error reading the file:", err);
  });
