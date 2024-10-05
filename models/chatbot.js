  const mongoose = require("mongoose");

  const chatbotSchema = mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId ,ref:"User",required:true},
    messages:[
      {
        sender: { type: String, required: true }, // 'user' or 'bot'
        text: { type: String, required: true},
        timestamp: { type: Date, default: Date.now }
      }
    ]
  })

  const chatbot = mongoose.model("chatbot",chatbotSchema)
  module.exports = chatbot;