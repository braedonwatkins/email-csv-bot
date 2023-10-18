import { createInterface } from "readline";
import { createReadStream } from "fs";
import csv from "csv-parser";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the name of the CSV file: ", (filename) => {
  const emailData = [];

  createReadStream(`./${filename}.csv`)
    .pipe(csv())
    .on("data", (row) => {
      emailData.push(row);
    })
    .on("end", () => {
      console.log("CSV file successfully processed", emailData);
    })
    .on("error", () => {
      console.log("Error reading the file. Please make sure the file exists.");
    });

  rl.close();
});
