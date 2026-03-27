import React, { useState, useEffect } from 'react';
import { socket } from './lib/socket';
import RoomOverlay from './components/RoomOverlay';
import Whiteboard from './components/Whiteboard';

export default function App() {
  const [joined, setJoined] = useState(false);
  const [roomData, setRoomData] = useState({ roomId: '', username: '', color: '' });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleJoin = (roomId, username, color) => {
    setRoomData({ roomId, username, color });
    socket.connect();
    socket.emit('join_room', { roomId, username, color });
    setJoined(true);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {!joined ? (
        <RoomOverlay onJoin={handleJoin} darkMode={darkMode} toggleTheme={toggleTheme} />
      ) : (
        <Whiteboard 
          roomId={roomData.roomId} 
          username={roomData.username} 
          userColor={roomData.color}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}
