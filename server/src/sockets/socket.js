import { Server } from "socket.io";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });
  });
};

const getSocket = () => {
  if (!io) {
    throw new Error("Socket not initialized!");
  }
  return io;
};

export { initSocket, getSocket };
