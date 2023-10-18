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
  
        <br />You can RSVP here: <a href="https://ASDFallOpenHouse2023.eventbrite.com">https://ASDFallOpenHouse2023.eventbrite.com<a>
  
        <br />If you aren't able to attend the Open House and would like to learn
        more, please reach out to us at <strong>407-960-1840</strong> or
        <a href="https://asdachievement.org/register/">click herem<a> to schedule a Meet n' Greet with us! We'll meet with you
        in-person at our center in Altamonte Springs (or on Zoom) to go over the
        programs we offer and answer any questions you may have. Anyone who
        registers for a Meet n' Greet by November 2nd will receive a coupon for
        20% off the price of our Spring 2024 programs! 
        
        <br/>If you have any questions, please don't hesitate to reach out. Achieve on!
  
        <br />

        _____________________

        <br/>
  
        <br />${senderName} | Administration <br />ASD Adult Achievement
        Center, Inc. <br />222 S Westmonte Dr, Suite 230, Altamonte Springs, 32714
        <br />Phone: (407) 960-1840 <br />
        <a href="https://nam02.safelinks.protection.outlook.com/?url=http%3A%2F%2Fwww.asdachievement.org%2F&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=NS%2BskLVtuCjryjycLu%2FXn5p8fAI6AMGzZUVLIU61Isw%3D&reserved=0"Website</a>
        | <a href="https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Flinktr.ee%2Fasdadultachievement&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=kufoUH0WOGGjx0RwNxy8decm1K%2FmQYJUhv6NSPWfBG8%3D&reserved=0">LinkTree</a> 
        | <a href="https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.facebook.com%2FAsdAchievement%2F&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=6NzXPXVyNzgykwggMSqU%2BIKOZ8EwgOcUYSWsbfTAslw%3D&reserved=0"Facebook</a> 
        | <a href="https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Ftwitter.com%2FAsdAchievement&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=fvnUVQs%2BW0BM8rS4ys7X0l71Mpx%2FAwZhWCc2Eu94HWA%3D&reserved=0">Twitter</a>
        | <a href="https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fcenter-for-autistic-achievement-inc%2F&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=zCbNor%2B%2BZ6F66RKhKaldu2CUEHtR6xvJaKxwtV5teQc%3D&reserved=0"LinkedIn</a> 
        | <a href="https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.instagram.com%2Fasdachievement%2F%3Fhl%3Den&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=%2B7b05DK3DgcaVaRKCJea6DLlb5%2Fqqx%2FYDeLxX%2BD8GiI%3D&reserved=0"Instagram</a> 
        
        <br/>
        <a href="https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DcBk2t1x5aeo&data=05%7C01%7Cem469206%40ucf.edu%7C2d28d9f536a94b6de71408dbafc7ab64%7Cbb932f15ef3842ba91fcf3c59d5dd1f1%7C0%7C0%7C638297044331289645%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=7x3ats7SVm024qBgZQaaVq5zQWm9kGV%2BBETeF%2BeMuiA%3D&reserved=0"Video</a> 
        highlighting our programs, testimonials, achievements, and future developments!
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
