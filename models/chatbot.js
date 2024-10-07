const mongoose = require("mongoose");

const chatbotSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  
  messages: [
    {
      question: { type: String, required: true }, 
      answer: { type: String, required: true }, 
    }
  ],
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }  
});

const Chatbot = mongoose.model("Chatbot", chatbotSchema);
module.exports = Chatbot;
