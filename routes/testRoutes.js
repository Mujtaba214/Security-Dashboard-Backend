import express from "express";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "mujtabausman21@gmail.com", // test recipient
      "Test Email",
      "This is a test email via Brevo SMTP"
    );
    res.json({ msg: "Email sent!" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

export default router;
