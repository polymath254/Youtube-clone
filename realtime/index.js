const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_video_room", (data) => {
    const room = `video_${data.video}`;
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("leave_video_room", (data) => {
    const room = `video_${data.video}`;
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
  });

  socket.on('send_comment', async (data) => {
    console.log("Received comment from frontend:", data);

    try {
      await axios.post("http://localhost:8000/api/comments/", {
        video: data.video,
        user: data.user,
        text: data.text,
      });
    } catch (err) {
      console.error("Failed to save comment to Django:", err.response ? err.response.data : err.message);
    }

    const room = `video_${data.video}`;
    socket.to(room).emit("receive_comment", data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Realtime server running on port ${PORT}`);
});
