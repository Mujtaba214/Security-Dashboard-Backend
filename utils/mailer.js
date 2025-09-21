import nodemailer from "nodemailer";
import env from "dotenv";

env.config();

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmail = async (to, name) => {
  try {
    await transporter.sendMail({
      from: `"My App" <${process.env.MAIL_USER}>`,
      to,
      subject: "Welcome to My App 🚀",
      html: `<h1>Welcome, ${name}!</h1><p>Thank you for signing up.</p>`,
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email send error:", error.message);
  }
};

export const sendPasswordResetEmail = async (to, link) => {
  try {
    await transporter.sendMail({
      from: `"My App" <${process.env.MAIL_USER}>`,
      to,
      subject: "password reset request",
      html: `<h1>Here is your token <br> ${link}!</h1><p><br>Thank you for co-operating with us.</p>`,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const sendLoginEmail = async (to, name, date) => {
  try {
    await transporter.sendMail({
      from: `"My App" <${process.env.MAIL_USER}>`,
      to,
      subject: "New Login Alert",
      html: `<h1>Welcome ${name}</h1><h4>Thank you for logging in</h4><p>New login alert/activity found at ${date}</p>`,
    });
  } catch (error) {
    console.log(error.message);
  }
};
