const Fuse = require('fuse.js');
const predefinedQuestions = require('./predefinedQuestions');
const Chat = require('../models/chat'); // Chat model for MongoDB

const options = {
  includeScore: true,
  threshold: 0.4,
  keys: ['question']
};

const fuse = new Fuse(predefinedQuestions, options);

function initializeChatSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('userMessage', async (message, userId) => {
      console.log('Message received from user:', message);

      const result = fuse.search(message);

      const botResponse = result.length > 0 ? result[0].item.answer : "Sorry, I don't understand that question.";

      // Emit bot response
      socket.emit('botResponse', botResponse);

      // Save chat to MongoDB if user is logged in
      if (userId) {
        await Chat.create({
          userId,
          userMessage: message,
          botResponse
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = initializeChatSocket;
