// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "rajasooriyakavindhya@gmail.com", // Use environment variables for email credentials
      pass: "hvom zpcn ywku mljl",
    },
  });

  const mailOptions = {
    from: "rajasooriyakavindhya@gmail.com",
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;