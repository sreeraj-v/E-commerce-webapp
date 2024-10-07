const Fuse = require('fuse.js');
const predefinedQuestions = require('./predefinedQuestions');
const Chat = require('../models/chatbot');
const sharedSession = require("socket.io-express-session");

const options = {
  includeScore: true,
  threshold: 0.4,
  keys: ['question']
};

const fuse = new Fuse(predefinedQuestions, options);

function initializeChatSocket(io, sessionMiddleware) {
  io.use(sharedSession(sessionMiddleware, { autoSave: true }));

  io.on('connection', async (socket) => {
    console.log('A user connected');
    const session = socket.handshake.session;
    const userId = session.user ? session.user._id : null;

    // Retrieve chat history only for logged-in users
    if (userId) {
      let chatHistory = await Chat.findOne({ userId: userId });
      if (chatHistory) {
        socket.emit('chatHistory', chatHistory.messages);
      } else {
        socket.emit('chatHistory', []);  // No history found
      }
    } else {
      // For guest users, do not retrieve or store any chat history
      socket.emit('chatHistory', []);  // Send an empty history to guests
    }

    socket.on('userMessage', async (message) => {
      console.log('Message received from user:', message);

      // Use Fuse.js to find the best match for the user's question
      const result = fuse.search(message);
      const botResponse = result.length > 0 ? result[0].item.answer : "Sorry, I don't understand that question.";

      // Only logged-in users have their chat stored in MongoDB
      if (userId) {
        await Chat.updateOne(
          { userId: userId },
          {
            $push: { messages: { question: message, answer: botResponse } }
          },
          { upsert: true }
        );
      }

      // Emit bot response to the client
      socket.emit('botResponse', botResponse);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = initializeChatSocket;
