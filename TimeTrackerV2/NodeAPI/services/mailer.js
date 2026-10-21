const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, text }) {
  const { SMTP_HOST, SMTP_PORT, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !MAIL_FROM) {
    throw new Error('Email delivery is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
  });

  return transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
  });
}

module.exports = { sendEmail };
