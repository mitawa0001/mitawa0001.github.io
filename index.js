const express = require("express");
const path = require("path");
var favicon = require("serve-favicon");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.json());

app.use(favicon(path.join(__dirname + "/assets/img/favicon.ico")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.post("/", (req, res) => {
  const { name, email, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).send("All fields are required");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email address");
  }

  // Sanitize inputs (basic XSS prevention)
  const sanitize = (str) => str.replace(/[<>]/g, "");
  const sanitizedName = sanitize(name.trim());
  const sanitizedMessage = sanitize(message.trim());

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL,
    subject: `Portfolio Contact: Message from ${sanitizedName}`,
    text: `Name: ${sanitizedName}\nEmail: ${email}\n\nMessage:\n${sanitizedMessage}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email error:", err);
      res.status(500).send("Failed to send message");
    } else {
      res.send("success");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server has started");
});
