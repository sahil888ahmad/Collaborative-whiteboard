import React, { useState, useEffect } from 'react';
import { Sun, Moon, Users, Sparkles, ArrowRight, Zap } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

export default function RoomOverlay({ onJoin, darkMode, toggleTheme }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [color, setColor] = useState(COLORS[4]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const p = Array.from({ length: 15 }, (_, i) => ({
      width: Math.random() * 60 + 10,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 15 + 8}s`,
      animationDelay: `${Math.random() * 8}s`,
    }));
    setParticles(p);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoin(roomId.trim(), username.trim(), color);
    }
  };

  const quickJoin = () => {
    const id = Math.random().toString(36).substr(2, 6).toUpperCase();
    setRoomId(id);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 overflow-hidden">
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-bg mesh-bg" />
      
      {/* Floating particles */}
      {particles.map((p, i) => (
        <Particle key={i} style={{
          width: p.width, height: p.width,
          left: p.left, bottom: '-60px',
          animationDuration: p.animationDuration,
          animationDelay: p.animationDelay,
        }} />
      ))}

      {/* Dark overlay for better glass contrast */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/20 dark:bg-black/30 hover:bg-white/30 dark:hover:bg-black/40 backdrop-blur-md border border-white/30 transition-all text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Hero text top */}
      <div className="absolute top-8 left-8 flex items-center gap-3 text-white animate-fade-in-up">
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest opacity-80">Real-time</div>
          <div className="text-lg font-bold">Collaborative Whiteboard</div>
        </div>
      </div>

      {/* Main card */}
      <div className="glass-panel rounded-3xl w-full max-w-md mx-4 animate-fade-in-scale relative overflow-hidden">

        {/* Card top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500 rounded-t-3xl" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
              <Users size={24} />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-center mb-1 bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
            Join the Canvas
          </h1>
          <p className="text-gray-400 text-center mb-8 text-sm">
            Enter a room to start drawing with your team in real-time
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Room ID */}
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. daily-standup"
                  className="input-glow flex-1 px-4 py-3 rounded-xl text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={quickJoin}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors whitespace-nowrap flex items-center gap-1"
                  title="Generate a random room"
                >
                  <Zap size={14} />
                  Random
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Your Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display name"
                className="input-glow w-full px-4 py-3 rounded-xl text-sm font-medium"
              />
            </div>

            {/* Cursor Color */}
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Your Cursor Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className="relative w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  >
                    {color === c && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-white dark:ring-offset-gray-900 shadow-lg" 
                            style={{ boxShadow: `0 0 0 2px ${c}` }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview badge */}
            {username && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ backgroundColor: color }}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{username}</div>
                  {roomId && <div className="text-xs text-gray-400">Room: <span className="font-mono font-bold">{roomId}</span></div>}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-base"
            >
              <Sparkles size={18} />
              Join Room
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-6 text-center text-white/60 text-xs">
        Share the Room ID with collaborators to draw together
      </div>
    </div>
  );
}
