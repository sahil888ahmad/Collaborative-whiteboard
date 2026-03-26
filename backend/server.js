const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store room states and users
// rooms: { [roomId]: { state: string (JSON), users: { [socketId]: { username, color } } } }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join_room', ({ roomId, username, color }) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = { state: null, users: {} };
    }
    
    // Add user to room
    rooms[roomId].users[socket.id] = { username, color };
    
    // Send current state to the joining user
    if (rooms[roomId].state) {
      socket.emit('canvas_state_from_server', rooms[roomId].state);
    }

    // Broadcast updated user list to everyone in the room
    io.to(roomId).emit('users_in_room', Object.values(rooms[roomId].users));
    
    console.log(`User ${username} joined room ${roomId}`);
  });

  // Handle drawing events (relaying individual actions)
  socket.on('draw_action', ({ roomId, action }) => {
    // Relay to everyone else in the room
    socket.to(roomId).emit('draw_action', action);
  });

  // Handle canvas full state save (for new users joining later)
  socket.on('save_canvas_state', ({ roomId, state }) => {
    if (rooms[roomId]) {
      rooms[roomId].state = state;
    }
  });

  // Clear board
  socket.on('clear_board', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].state = null;
    }
    socket.to(roomId).emit('clear_board');
  });

  // Undo / Redo synchronization
  socket.on('undo_redo_sync', ({ roomId, state }) => {
    if (rooms[roomId]) {
      rooms[roomId].state = state;
    }
    socket.to(roomId).emit('canvas_state_from_server', state);
  });

  // Live cursor movement
  socket.on('cursor_move', ({ roomId, pointer }) => {
    const user = rooms[roomId]?.users[socket.id];
    if (user) {
      socket.to(roomId).emit('cursor_move', {
        socketId: socket.id,
        username: user.username,
        color: user.color,
        pointer
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find rooms this user was in and remove them
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id];
        
        // Notify others
        io.to(roomId).emit('users_in_room', Object.values(rooms[roomId].users));
        
        // Also remove their cursor
        io.to(roomId).emit('user_left', socket.id);
        
        // Clean up empty rooms
        if (Object.keys(rooms[roomId].users).length === 0) {
          // Optional: we can delete the room, but keeping it means history persists until server restart
          // delete rooms[roomId]; 
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
