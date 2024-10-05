const Fuse = require('fuse.js');
const predefinedQuestions = require('./predefinedQuestions');
const Chat = require('../models/chatbot'); // Chat model for MongoDB

const options = {
  includeScore: true,
  threshold: 0.4,
  keys: ['question']
};

const fuse = new Fuse(predefinedQuestions, options);

function initializeChatSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('userMessage', async (message) => {
      console.log('Message received from user:', message);

      // Fuse.js search
      const result = fuse.search(message);
      const botResponse = result.length > 0 ? result[0].item.answer : "Sorry, I don't understand that question.";

      const session = socket.request.session;
      const userId = session.user ? session.user._id : null;

      // Store chat messages
      if (userId) {
        // Logged-in user: save to MongoDB
        await Chat.updateOne(
          { userId: userId },
          {
            $push: {
              messages: { sender: 'user', text: message },
            },
            $push: {
              messages: { sender: 'bot', text: botResponse }
            }
          },
          { upsert: true }
        );
      } else {
        // Non-logged-in user: save to session
        if (!session.chatHistory) session.chatHistory = [];
        session.chatHistory.push({ sender: 'user', text: message });
        session.chatHistory.push({ sender: 'bot', text: botResponse });
        session.save();
      }

      // Emit bot response
      socket.emit('botResponse', botResponse);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = initializeChatSocket;
