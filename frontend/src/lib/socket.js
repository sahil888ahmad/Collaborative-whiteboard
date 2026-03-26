import { io } from 'socket.io-client';

// Construct the server URL assuming it's running on port 3001 locally.
// For production, use an environment variable.
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect manually when joining a room
});
