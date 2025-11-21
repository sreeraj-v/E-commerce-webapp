require('dotenv').config()
const nodemailer = require("nodemailer")
const {EMAIL_USER, EMAIL_PASS} = process.env

const transporter = nodemailer.createTransport({ 
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  // INCREASE TIMEOUTS (Render Free Tier CPU is slow)
  connectionTimeout: 60000, // 1 minute
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 1 minute
  // ALLOW SELF-SIGNED CERTS (Helps on Cloud Proxies)
  tls: {
    rejectUnauthorized: false
  },
  // ENABLE DEBUG LOGS (To see exactly where it hangs in Render logs)
  logger: true,
  debug: true 
})

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