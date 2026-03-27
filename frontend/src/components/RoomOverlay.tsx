import React, { useState } from 'react';
import { Sun, Moon, Users, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Entropy } from './ui/entropy';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

interface RoomOverlayProps {
  onJoin: (roomId: string, username: string, color: string) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function RoomOverlay({ onJoin, darkMode, toggleTheme }: RoomOverlayProps) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [color, setColor] = useState(COLORS[4]);

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="absolute inset-0 flex items-center justify-center z-50 overflow-hidden bg-gray-50 dark:bg-black transition-colors">
      
      {/* Entropy Background Design */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
        <Entropy size={Math.max(window.innerWidth, window.innerHeight)} isDark={darkMode} />
      </div>
      
      {/* Overlay for better glass contrast */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/40 transition-colors" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/20 transition-all text-gray-800 dark:text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 z-[60]"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Hero text top */}
      <div className="absolute top-8 left-8 flex items-center gap-3 text-gray-900 dark:text-white animate-fade-in-up z-[60] transition-colors">
        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20">
          <Sparkles size={22} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest opacity-60">Real-time</div>
          <div className="text-lg font-bold">Collaborative Whiteboard</div>
        </div>
      </div>

      {/* Main card */}
      <div className="glass-panel rounded-3xl w-full max-w-md mx-4 animate-fade-in-scale relative overflow-hidden z-[60]">

        {/* Card top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500 rounded-t-3xl" />

        <div className="p-8 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-b-3xl border-t border-black/5 dark:border-white/10 border-b border-l border-r border-transparent transition-colors">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
              <Users size={24} />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-center mb-1 bg-gradient-to-br from-violet-700 to-indigo-700 dark:from-violet-600 dark:to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
            Join the Canvas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8 text-sm transition-colors">
            Enter a room to start drawing with your team in real-time
          </p>


          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-gray-400 transition-colors">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. daily-standup"
                  className="input-glow flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={quickJoin}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Zap size={14} />
                  Random
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-gray-400 transition-colors">
                Your Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display name"
                className="input-glow w-full px-4 py-3 rounded-xl text-sm font-medium bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-500 dark:text-gray-400 transition-colors">
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
                  >
                    {color === c && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-900 shadow-lg" 
                            style={{ boxShadow: `0 0 0 2px ${c}` }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-base shadow-xl shadow-indigo-500/20"
            >
              <Sparkles size={18} />
              Join Room
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>


    </div>
  );
}
