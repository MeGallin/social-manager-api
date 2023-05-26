const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: 587, //Default port number 587
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PW,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.MAILER_FROM,
    to: options.to, //Change this to options.to when you go live
    bcc: process.env.MAILER_BCC,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
