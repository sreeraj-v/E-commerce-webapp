require('dotenv').config()
const nodemailer = require("nodemailer")
const {EMAIL_USER,EMAIL_PASS} = process.env

const transporter = nodemailer.createTransport({ 
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth:{
    user:EMAIL_USER,
    pass:EMAIL_PASS
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,  
})

module.exports = transporter;