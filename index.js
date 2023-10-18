import { createInterface } from "readline";
import { createReadStream } from "fs";
import csv from "csv-parser";
import nodemailer from "nodemailer";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

const { senderEmail, senderName, pass, appPass, client_id, private_key } =
  process.env;

// Read the file once and cache it
let masterFlyer;
let openHouseFlyer;
fs.promises
  .readFile("./master-flyer.pdf")
  .then((data) => {
    masterFlyer = data;
  })
  .catch(console.error);
fs.promises
  .readFile("./open-house.pdf")
  .then((data) => {
    openHouseFlyer = data;
  })
  .catch(console.error);

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
          attachments: [
            {
              filename: "master-flyer.pdf",
              content: masterFlyer,
            },
            {
              filename: "open-house.pdf",
              content: openHouseFlyer,
            },
          ],
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
    <body style="font-family: Georgia, sans-serif; margin: 0; padding: 20px; color: black; font-size: 15px">
  
      <!-- Body -->
      <div style="padding: 20px">
        Good morning${formattedName}
        
        <br/><br/>
        We welcome you to join us for our ASD Adult Programs'
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
  
        <br /><br/>
        Discover how our programs can help individuals with Level 1 Autism
  
        <u
          >develop essential life skills, gain independence, and foster meaningful
          connections </u
        >. Whether you're seeking vocational training, social opportunities, or
        personal growth, our programs are tailored to meet your unique needs.
        Don't miss this incredible opportunity to learn more about our ASD Adult
        Programs. We look forward to welcoming you!
  
        <br /><br/>
        You can RSVP here: <a href="https://ASDFallOpenHouse2023.eventbrite.com">https://ASDFallOpenHouse2023.eventbrite.com<a>
  
        <br /><br />
        If you aren't able to attend the Open House and would like to learn
        more, please reach out to us at <strong>407-960-1840</strong> or
        <a href="https://asdachievement.org/register/">click here<a> to schedule a Meet n' Greet with us! We'll meet with you
        in-person at our center in Altamonte Springs (or on Zoom) to go over the
        programs we offer and answer any questions you may have. Anyone who
        registers for a Meet n' Greet by November 2nd will receive a coupon for
        20% off the price of our Spring 2024 programs! 
        
        <br/><br/>
        If you have any questions, please don't hesitate to reach out. 
        <br>Achieve on!
  
        <br /><br/>

        _____________________

        <br/><br/>
  
        <div>
        <span style="font-family: 'Garamond', 'Times New Roman', Times, serif; font-size: 20px; font-weight: bold">${senderName}</span>
        | <strong>Administration</strong> <br />
        ASD Adult Achievement Center, Inc. 
        </div>

        <br />222 S Westmonte Dr, Suite 230, Altamonte Springs, 32714

        <br />Phone: (407) 960-1840 <br />
        <strong><a href="https://asdachievement.org/">Website</a></strong>
        | <strong><a href="https://linktr.ee/asdadultachievement">LinkTree</a></strong> 
        | <strong><a href="https://www.facebook.com/AsdAchievement/">Facebook</a></strong>
        | <strong><a href="https://twitter.com/AsdAchievement">Twitter</a></strong>
        | <strong><a href="https://www.linkedin.com/company/center-for-autistic-achievement-inc/">LinkedIn</a></strong>
        | <strong><a href="https://www.instagram.com/asdachievement/?hl=en">Instagram</a></strong>
        
        <br/>
        <a href="https://www.youtube.com/watch?v=cBk2t1x5aeo">Video</a> 
        highlighting our programs, testimonials, achievements, and future developments!
      </div>
  
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
