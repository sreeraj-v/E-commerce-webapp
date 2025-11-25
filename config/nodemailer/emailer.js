require('dotenv').config();
const nodemailer = require("nodemailer");

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