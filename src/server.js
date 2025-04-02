// server.js

import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Twilio credentials from environment variables
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Endpoint to send WhatsApp message
app.post("/send-message", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing phoneNumber or message" });
    }

    const messageResponse = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    res.json({ success: true, messageId: messageResponse.sid });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Automated daily reminders at 7 AM
cron.schedule("0 7 * * *", async () => {
  console.log("Running scheduled reminder check...");
  try {
    const currentDateTime = new Date().toISOString();
    const reminderDateTime = new Date();
    reminderDateTime.setDate(reminderDateTime.getDate() + 1);

    // Fetch only necessary data with efficient query
    const { data: tasks, error } = await supabase
      .from("client_case_task")
      .select(
        "client_case_task, deadline, client_case (cases (case_no), clients (contact_no))"
      )
      .gte("deadline", currentDateTime)
      .lte("deadline", reminderDateTime.toISOString());

    if (error) throw error;

    for (const task of tasks) {
      const { client_case_task, deadline, client_case } = task;
      const caseNo = client_case.cases.case_no;
      const contactNo = client_case.clients.contact_no;

      const messageBody = `Reminder: The task "${client_case_task}" for case "${caseNo}" is due tomorrow (${deadline}).`;

      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:${contactNo}`,
        body: messageBody,
      });

      console.log(`Reminder sent for task "${client_case_task}".`);
    }
  } catch (error) {
    console.error("Error in automated reminder process:", error);
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
