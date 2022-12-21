const nodeMailer = require('nodemailer');

exports.sendEmail = async function (options) {
  // Creating a transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Define the email options
  const mailOptions = {
    from: 'Hello <hello@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Sending Email
  await transporter.sendMail(mailOptions);
};
