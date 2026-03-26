import React from 'react';
import { MousePointer2 } from 'lucide-react';

export default function LiveCursors({ cursors }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.socketId}
          className="absolute transform -translate-x-1 -translate-y-1 transition-transform duration-75 ease-out flex flex-col items-start drop-shadow-md"
          style={{
            transform: `translate(${cursor.pointer.x}px, ${cursor.pointer.y}px)`,
          }}
        >
          <MousePointer2
            size={24}
            fill={cursor.color}
            color={cursor.color}
            className="-rotate-12"
          />
          <div
            className="px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg font-medium whitespace-nowrap mt-1"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </div>
  );
}
