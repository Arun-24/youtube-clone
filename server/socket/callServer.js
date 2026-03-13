import { Server } from "socket.io";

export const initCallServer = (server) => {

  const io = new Server(server, {
    cors: { origin: "*" }
  });

  const rooms = {};

  io.on("connection", (socket) => {

    socket.on("create-room", (roomId) => {

      rooms[roomId] = {
        host: socket.id,
        participants: [socket.id]
      };

      socket.join(roomId);

    });

    socket.on("request-join", ({ roomId }) => {

      const room = rooms[roomId];

      if (!room) return;

      io.to(room.host).emit("join-request", {
        userId: socket.id,
        roomId
      });

    });

    socket.on("approve-join", ({ userId, roomId }) => {

      const room = rooms[roomId];
      if (!room) return;

      room.participants.push(userId);

      io.to(userId).emit("join-approved", roomId);

      socket.to(roomId).emit("user-joined", userId);

    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("offer", (data) => {
      socket.to(data.roomId).emit("offer", data.offer);
    });

    socket.on("answer", (data) => {
      socket.to(data.roomId).emit("answer", data.answer);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.roomId).emit("ice-candidate", data.candidate);
    });

  });

};