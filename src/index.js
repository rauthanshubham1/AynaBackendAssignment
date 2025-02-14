"use strict";
const { Server } = require("socket.io");
const axios = require("axios");

module.exports = {
  register() { },

  bootstrap({ strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join", ({ from, to }) => {
        if (from && to) {
          const room = [from, to].sort().join("_");
          socket.join(room);
          console.log(`User ${from} joined room: ${room}`);
        }
      });

      socket.on("sendMessage", async (data) => {
        try {
          const strapiData = {
            data: {
              from: data.from,
              to: data.to,
              message: data.message,
            },
          };


          const room = [data.from, data.to].sort().join("_");
          io.to(room).emit("message", {
            from: data.from,
            to: data.to,
            message: data.message,
          });

          console.log(`Message sent from ${data.from} to ${data.to}: ${data.message}`);
        } catch (error) {
          console.error("Error sending message:", error.message);
        } socket.on("sendMessage", async (data) => {
          try {
            const strapiData = {
              data: {
                from: data.from,
                to: data.to,
                message: data.message,
                isRead: false, 
              },
            };

            await axios.post("http://localhost:1337/api/messages", strapiData, {
              headers: { Authorization: `Bearer ${data.token}` },
            });

            const room = [data.from, data.to].sort().join("_");
            io.to(room).emit("message", {
              from: data.from,
              to: data.to,
              message: data.message,
            });

            io.emit("newMessageNotification", {
              from: data.from,
              to: data.to,
              message: data.message,
            });

            console.log(`Message sent from ${data.from} to ${data.to}: ${data.message}`);
          } catch (error) {
            console.error("Error sending message:", error.message);
          }
        });
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  },
};
