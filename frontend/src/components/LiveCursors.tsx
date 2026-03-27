import React from 'react';
import { MousePointer2 } from 'lucide-react';

interface CursorData {
  socketId: string;
  username: string;
  color: string;
  pointer: { x: number; y: number };
}

interface LiveCursorsProps {
  cursors: Record<string, CursorData>;
}

export default function LiveCursors({ cursors }: LiveCursorsProps) {
  return (
    <>
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.socketId}
          className="absolute z-[100] pointer-events-none transition-all duration-100 ease-out"
          style={{
            left: cursor.pointer.x,
            top: cursor.pointer.y,
            transform: 'translate(-5px, -5px)',
          }}
        >
          <MousePointer2
            size={24}
            style={{
              fill: cursor.color,
              color: cursor.color,
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))',
            }}
          />
          <div
            className="ml-4 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white whitespace-nowrap shadow-lg animate-fade-in-up"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </>
  );
}
