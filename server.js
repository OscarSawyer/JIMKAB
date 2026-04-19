import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("JIMKAB backend is running");
});

app.post("/api/contact", async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      serviceNeeded,
      location,
      message
    } = req.body;

    if (!fullName || !phoneNumber || !serviceNeeded || !location || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email to owner
    await transporter.sendMail({
      from: `"JIMKAB Website" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `New Request - ${fullName}`,
      html: `
        <h2>New Electrical Service Request</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Phone:</b> ${phoneNumber}</p>
        <p><b>Email:</b> ${email || "N/A"}</p>
        <p><b>Service:</b> ${serviceNeeded}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    });

    // Auto reply
    if (email) {
      await transporter.sendMail({
        from: `"JIMKAB Electrical" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "We received your request",
        html: `
          <p>Hello ${fullName},</p>
          <p>Your request has been received. We will contact you shortly.</p>
          <p><b>Call:</b> 0788573000</p>
        `
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});