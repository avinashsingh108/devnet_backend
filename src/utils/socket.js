const { Server } = require("socket.io");
const { Chat } = require("../models/chat");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("sendMessage", async (msgData) => {
      const room = [msgData.senderId._id, msgData.receiver].sort().join("-");
      try {
        let chat = await Chat.findOne({
          participants: { $all: [msgData.senderId._id, msgData.receiver] },
        });
        if (!chat) {
          chat = new Chat({
            participants: [msgData.senderId._id, msgData.receiver],
            messages: [],
          });
        }
        chat.messages.push({
          senderId: msgData.senderId._id,
          message: msgData.message,
          createdAt: msgData.createdAt,
        });
        await chat.save();
        io.to(room).emit("receiveMessage", msgData);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
    });

    socket.on("disconnect", () => {
    });
  });

  return io;
}

module.exports = initializeSocket;
