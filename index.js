import { createInterface } from "readline";
import { createReadStream } from "fs";
import csv from "csv-parser";
import nodemailer from "nodemailer";
import { google } from "googleapis";

import dotenv from "dotenv";
dotenv.config();

const { senderEmail, senderName, pass, client_id, private_key } = process.env;

console.log(senderEmail);
console.log(pass);

const gmail = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: senderEmail,
    pass: pass,
  },
});

const SENDMAIL = async (mailDetails, callback) => {
  try {
    const info = await gmail.sendMail(mailDetails);
    callback(info);
  } catch (error) {
    console.log(error);
  }
};

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

      // Loop over the email data and send emails
      for (const {
        "First Name": firstName,
        "Last Name": lastName,
        "Email Address": emailAddress,
      } of emailData) {
        const mailOptions = {
          from: `${senderEmail}`,
          to: emailAddress,
          subject: `Hello ${firstName} ${lastName}`,
          text: `Dear ${firstName} ${lastName},\n\nThis is a test email.\n\nBest regards,\n${senderName}`,
        };

        gmail.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(`Error sending email to ${emailAddress}: `, error);
          } else {
            console.log(`Email sent to ${emailAddress}: ${info.response}`);
          }
        });
      }
    })
    .on("error", () => {
      console.log("Error reading the file. Please make sure the file exists.");
    });

  rl.close();
});
