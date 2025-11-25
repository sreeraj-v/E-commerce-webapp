require('dotenv').config();
const nodemailer = require("nodemailer");

console.log("DEBUG EMAIL_USER:", process.env.EMAIL_USER);
console.log("DEBUG EMAIL_PASS length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : "undefined");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP VERIFY ERROR:", err);
  } else {
    console.log("SMTP SERVER IS READY TO TAKE OUR MESSAGES");
  }
});

module.exports = transporter;



// require('dotenv').config()
// const nodemailer = require("nodemailer")
// const {EMAIL_USER,EMAIL_PASS} = process.env

// const transporter = nodemailer.createTransport({ 
//   service:"Gmail",
//   auth:{
//     user:EMAIL_USER,
//     pass:EMAIL_PASS
//   }
// })

// module.exports = transporter;