import { createInterface } from "readline";
import { createReadStream } from "fs";
import csv from "csv-parser";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const { senderEmail, senderName, pass, appPass, client_id, private_key } =
  process.env;

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
        "Email Address": receiverEmail,
      } of emailData) {
        let formattedName = ",";
        if (firstName && lastName) {
          formattedName = ` ${firstName} ${lastName},`;
        } else if (firstName) {
          formattedName = ` ${firstName},`;
        } else if (lastName) {
          formattedName = ` ${lastName} household,`;
        }
        const options = {
          from: `${senderEmail}`,
          to: `${receiverEmail}`,
          subject: "ASD Achievement Center- Fall 2023 Open House",
          html: templateMessage(formattedName),
        };

        sendEmail(options);
      }
    })
    .on("error", () => {
      console.log("Error reading the file. Please make sure the file exists.");
    });

  rl.close();
});

const gmail = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: senderEmail,
    pass: appPass,
  },
});

const sendEmail = async (mailDetails) => {
  try {
    const info = await gmail.sendMail(mailDetails);
    console.log("Email sent successfully");
    console.log("MESSAGE ID: ", info.messageId);
  } catch (error) {
    console.log(error);
  }
};

const templateMessage = (formattedName) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Your Email Subject Here</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px">
      <!-- Header -->
      <!-- <div style="background-color: #f2f2f2; padding: 20px">
        <h1 style="margin: 0">Welcome to My App</h1>
      </div> -->
  
      <!-- Body -->
      <div style="padding: 20px">
        Good morning${formattedName} We welcome you to join us for our ASD Adult Programs'
        Open House on <strong>Thursday, November 2, 2023</strong> from
        <strong>4:00pm - 6:00pm</strong>! This exciting event is your chance to
        explore our unique programs designed specifically for adults, including
        recent high school graduates, with Level 1 Autism. Located at
        <strong>222 S Westmonte Dr Suite 230, Altamonte Springs, FL 32714</strong
        >, the Open House will offer an opportunity to learn more about our
        programs for young adults ages 18-35. You'll have the chance to meet our
        dedicated team, including experienced professionals who specialize in ASD
        support. They will be available to answer any questions you may have and
        provide insight into the programs we offer.
  
        <br />
        Discover how our programs can help individuals with Level 1 Autism
  
        <u
          >develop essential life skills, gain independence, and foster meaningful
          connections </u
        >. Whether you're seeking vocational training, social opportunities, or
        personal growth, our programs are tailored to meet your unique needs.
        Don't miss this incredible opportunity to learn more about our ASD Adult
        Programs. We look forward to welcoming you!
  
        <br />You can RSVP here: https://ASDFallOpenHouse2023.eventbrite.com
  
        <br />If you aren't able to attend the Open House and would like to learn
        more, please reach out to us at <strong>407-960-1840</strong> or
        <u>click here</u> to schedule a Meet n' Greet with us! We'll meet with you
        in-person at our center in Altamonte Springs (or on Zoom) to go over the
        programs we offer and answer any questions you may have. Anyone who
        registers for a Meet n' Greet by November 2nd will receive a coupon for
        20% off the price of our Spring 2024 programs! If you have any questions,
        please don't hesitate to reach out. Achieve on!
  
        <br />
  
        <br />${senderName} | Administration <br />ASD Adult Achievement
        Center, Inc. <br />222 S Westmonte Dr, Suite 230, Altamonte Springs, 32714
        <br />Phone: (407) 960-1840 <br />Website | LinkTree | Facebook | Twitter
        | LinkedIn | Instagram Video highlighting our programs, testimonials,
        achievements, and future developments!
      </div>
  
      <!-- FIXME: ADD LINKS & ATTACHMENTS -->
      <!-- Footer -->
      <!-- <div style="background-color: #f2f2f2; padding: 10px">
        <p style="margin: 0; font-size: 12px">
          This is an automated email, please do not reply.
        </p>
      </div> -->
    </body>
  </html>
  `;
};
