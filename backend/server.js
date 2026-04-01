const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const complaintRoutes = require('./routes/complaints');
const { router: authRoutes } = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set('socketio', io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// WebSocket Connect Logic
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);
  socket.on('disconnect', () => {
     console.log('User disconnected');
  });
});

// Database connection logic handling Memory Server Emulation natively
async function initDB() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {});
    console.log('Automated In-Memory MongoDB booted & connected seamlessly -> ' + uri);
  } catch (err) {
    console.error('Failed to boot MongoDB cluster natively:', err);
  }
}
initDB();

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Agentic AI Smart City API is running.');
});

server.listen(PORT, () => {
  console.log(`Server is running with WebSockets active on port ${PORT}`);
});
