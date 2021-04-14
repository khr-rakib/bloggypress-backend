const nodemailer = require('nodemailer')

exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_FROM, // generated ethereal user
      pass: process.env.NODEMAILER_AUTH_PASSWORD, // generated ethereal password
    },
  });