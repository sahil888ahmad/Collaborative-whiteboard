import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { socket } from '../lib/socket';
import Toolbar from './Toolbar';
import LiveCursors from './LiveCursors';
import { LogOut, Sun, Moon, Users } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface WhiteboardProps {
  roomId: string;
  username: string;
  userColor: string;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function Whiteboard({ roomId, username, userColor, darkMode, toggleTheme }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentTool, setCurrentTool] = useState('pen');
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(20);
  const [selectedEmoji, setSelectedEmoji] = useState('😀');
  const [cursors, setCursors] = useState<Record<string, any>>({});
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      isDrawingMode: true,
      backgroundColor: darkMode ? '#111827' : '#f9fafb',
    });

    setCanvas(fabricCanvas);

    historyRef.current = [JSON.stringify(fabricCanvas.toJSON(['id']))];
    historyIndexRef.current = 0;

    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = darkMode ? '#111827' : '#f9fafb';
      canvas.requestRenderAll();
    }
  }, [darkMode, canvas]);

  useEffect(() => {
    if (!canvas) return;

    const handleCanvasState = async (stateStr: string) => {
      if (!stateStr) return;
      isSyncingRef.current = true;
      try {
          await canvas.loadFromJSON(stateStr);
          canvas.requestRenderAll();
          historyRef.current = [stateStr];
          historyIndexRef.current = 0;
      } catch (e) { console.error('Error loading JSON state', e); }
      finally {
          isSyncingRef.current = false;
      }
    };

    const handleClearBoard = () => {
      isSyncingRef.current = true;
      canvas.clear();
      canvas.backgroundColor = darkMode ? '#111827' : '#f9fafb';
      historyRef.current = [JSON.stringify(canvas.toJSON(['id']))];
      historyIndexRef.current = 0;
      isSyncingRef.current = false;
    };

    const handleUsersUpdate = (users: any[]) => {
      setOnlineUsers(users);
    };

    const handleCursorMove = (cursorData: any) => {
      setCursors((prev) => ({
        ...prev,
        [cursorData.socketId]: cursorData,
      }));
    };

    const handleUserLeft = (socketId: string) => {
      setCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on('canvas_state_from_server', handleCanvasState);
    socket.on('clear_board', handleClearBoard);
    socket.on('users_in_room', handleUsersUpdate);
    socket.on('cursor_move', handleCursorMove);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('canvas_state_from_server');
      socket.off('clear_board');
      socket.off('users_in_room');
      socket.off('cursor_move');
      socket.off('user_left');
    };
  }, [canvas, darkMode]);

  useEffect(() => {
    if (!canvas) return;

    const saveState = () => {
      if (isSyncingRef.current) return;
      const json = JSON.stringify(canvas.toJSON(['id']));
      const nextIndex = historyIndexRef.current + 1;
      const nextHistory = historyRef.current.slice(0, nextIndex);
      nextHistory.push(json);
      historyRef.current = nextHistory;
      historyIndexRef.current = nextIndex;
      socket.emit('save_canvas_state', { roomId, state: json });
      socket.emit('undo_redo_sync', { roomId, state: json });
    };

    canvas.on('path:created', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('object:added', (e: any) => {
      if (!isSyncingRef.current && e.target && e.target.type !== 'path') {
         saveState();
      }
    });

    return () => {
      canvas.off('path:created');
      canvas.off('object:modified');
      canvas.off('object:removed');
      canvas.off('object:added');
    };
  }, [canvas, roomId]);

  useEffect(() => {
    if (!canvas) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let currentShape: any = null;

    canvas.isDrawingMode = currentTool === 'pen' || currentTool === 'dash' || currentTool === 'eraser' || currentTool === 'highlighter';
    canvas.selection = currentTool === 'select';
    canvas.skipTargetFind = currentTool !== 'select' && currentTool !== 'eraser_object';
    
    let cursorStyle = 'default';
    if (currentTool === 'select') {
      cursorStyle = 'default';
    } else if (currentTool === 'text') {
      cursorStyle = 'text';
    } else if (['rect', 'circle', 'triangle', 'line', 'eraser_object'].includes(currentTool)) {
      cursorStyle = 'crosshair';
    } else if (currentTool === 'emoji') {
       const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><text y="40" font-size="36">${selectedEmoji}</text></svg>`;
       cursorStyle = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 24 24, crosshair`;
    } else if (['pen', 'dash', 'highlighter', 'eraser'].includes(currentTool)) {
       const sizeMultiplier = currentTool === 'highlighter' ? 3 : 1;
       const rawSize = currentTool === 'eraser' ? eraserSize : (brushSize * sizeMultiplier);
       const cSize = Math.max(rawSize, 4);
       let fill = encodeURIComponent(color);
       let stroke = 'rgba(0,0,0,0.5)';
       if (currentTool === 'eraser') {
         fill = 'rgba(255,255,255,0.7)';
         stroke = 'black';
       } else if (currentTool === 'highlighter') {
         fill = encodeURIComponent(color);
         stroke = 'transparent';
       } else {
         stroke = 'rgba(0,0,0,0.2)';
       }
       const boxSize = cSize + 4;
       const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxSize}" height="${boxSize}"><circle cx="${boxSize/2}" cy="${boxSize/2}" r="${cSize/2}" fill="${fill}" stroke="${stroke}" stroke-width="1" /></svg>`;
       cursorStyle = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") ${boxSize/2} ${boxSize/2}, crosshair`;
    }
    
    canvas.defaultCursor = cursorStyle;
    canvas.hoverCursor = cursorStyle;
    
    if (canvas.isDrawingMode) {
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.strokeDashArray = null;
      if (currentTool === 'eraser') {
        canvas.freeDrawingBrush.color = darkMode ? '#111827' : '#f9fafb';
        canvas.freeDrawingBrush.width = eraserSize;
      } else if (currentTool === 'highlighter') {
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        canvas.freeDrawingBrush.color = color.startsWith('#') ? hexToRgba(color, 0.4) : color;
        canvas.freeDrawingBrush.width = brushSize * 3;
      } else if (currentTool === 'dash') {
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.strokeDashArray = [brushSize * 3, brushSize * 2];
      } else {
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = brushSize;
      }
    }

    const onMouseDown = (o: any) => {
      if (currentTool === 'eraser_object') {
        if (o.target) {
          canvas.remove(o.target);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
        return;
      }
      if (canvas.isDrawingMode) return;
      const pointer = typeof (canvas as any).getScenePoint === 'function' ? (canvas as any).getScenePoint(o.e) : (o.scenePoint || canvas.getPointer(o.e));
      isDown = true;
      startX = pointer.x;
      startY = pointer.y;

      if (currentTool === 'rect') {
        currentShape = new fabric.Rect({
          left: startX, top: startY, width: 0, height: 0,
          fill: 'transparent', stroke: color, strokeWidth: brushSize,
          id: generateId()
        } as any);
        canvas.add(currentShape);
      } else if (currentTool === 'circle') {
        currentShape = new fabric.Circle({
          left: startX, top: startY, radius: 0,
          fill: 'transparent', stroke: color, strokeWidth: brushSize,
          id: generateId()
        } as any);
        canvas.add(currentShape);
      } else if (currentTool === 'triangle') {
        currentShape = new fabric.Triangle({
          left: startX, top: startY, width: 0, height: 0,
          fill: 'transparent', stroke: color, strokeWidth: brushSize,
          id: generateId()
        } as any);
        canvas.add(currentShape);
      } else if (currentTool === 'line') {
        currentShape = new fabric.Line([startX, startY, startX, startY], {
          stroke: color, strokeWidth: brushSize,
          id: generateId()
        } as any);
        canvas.add(currentShape);
      } else if (currentTool === 'text') {
         const text = new fabric.IText('Type here...', {
            left: startX, top: startY, fill: color,
            fontSize: brushSize * 4, fontFamily: 'Inter',
            id: generateId()
         } as any);
         canvas.add(text);
         canvas.setActiveObject(text);
         text.enterEditing();
         text.selectAll();
         isDown = false;
      } else if (currentTool === 'emoji') {
         const emoji = new fabric.IText(selectedEmoji, {
            left: startX, top: startY, fontSize: brushSize * 10,
            id: generateId(), selectable: true,
         } as any);
         canvas.add(emoji);
         canvas.setActiveObject(emoji);
         isDown = false;
      }
    };

    const onMouseMove = (o: any) => {
      const pointer = typeof (canvas as any).getScenePoint === 'function' ? (canvas as any).getScenePoint(o.e) : (o.scenePoint || canvas.getPointer(o.e));
      socket.emit('cursor_move', { roomId, pointer });
      if (!isDown || canvas.isDrawingMode || currentTool === 'text' || currentTool === 'emoji' || currentTool === 'eraser_object') return;
      if (currentTool === 'rect' && currentShape) {
        currentShape.set({
          width: Math.abs(pointer.x - startX), height: Math.abs(pointer.y - startY),
          left: pointer.x < startX ? pointer.x : startX,
          top: pointer.y < startY ? pointer.y : startY
        });
      } else if (currentTool === 'circle' && currentShape) {
        const radius = Math.max(Math.abs(pointer.x - startX), Math.abs(pointer.y - startY)) / 2;
        currentShape.set({
          radius: radius,
          left: startX > pointer.x ? startX - radius * 2 : startX,
          top: startY > pointer.y ? startY - radius * 2 : startY
        });
      } else if (currentTool === 'triangle' && currentShape) {
        currentShape.set({
          width: Math.abs(pointer.x - startX), height: Math.abs(pointer.y - startY),
          left: pointer.x < startX ? pointer.x : startX,
          top: pointer.y < startY ? pointer.y : startY
        });
      } else if (currentTool === 'line' && currentShape) {
        currentShape.set({ x2: pointer.x, y2: pointer.y });
      }
      canvas.requestRenderAll();
    };

    const onMouseUp = () => {
      if (canvas.isDrawingMode) return;
      isDown = false;
      if (currentShape) {
         currentShape.setCoords();
         canvas.fire('object:modified', { target: currentShape });
         currentShape = null;
      }
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [canvas, currentTool, color, brushSize, eraserSize, selectedEmoji, darkMode, roomId]);

  const handleUndo = useCallback(async () => {
    if (!canvas) return;
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const state = historyRef.current[historyIndexRef.current];
      isSyncingRef.current = true;
      try {
        await canvas.loadFromJSON(state);
        canvas.requestRenderAll();
        socket.emit('undo_redo_sync', { roomId, state });
      } catch (e) { console.error('Undo failed', e); }
      finally { isSyncingRef.current = false; }
    }
  }, [canvas, roomId]);

  const handleRedo = useCallback(async () => {
    if (!canvas) return;
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const state = historyRef.current[historyIndexRef.current];
      isSyncingRef.current = true;
      try {
        await canvas.loadFromJSON(state);
        canvas.requestRenderAll();
        socket.emit('undo_redo_sync', { roomId, state });
      } catch (e) { console.error('Redo failed', e); }
      finally { isSyncingRef.current = false; }
    }
  }, [canvas, roomId]);

  const handleClear = () => {
    if (!canvas) return;
    if (window.confirm('Are you sure you want to clear the board?')) {
      canvas.clear();
      canvas.backgroundColor = darkMode ? '#111827' : '#f9fafb';
      historyRef.current = [];
      historyIndexRef.current = -1;
      socket.emit('clear_board', { roomId });
    }
  };

  const handleDownload = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ multiplier: 1 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `whiteboard-${roomId}.png`;
    link.click();
  };

  const leaveRoom = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Toolbar 
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        selectedEmoji={selectedEmoji}
        setSelectedEmoji={setSelectedEmoji}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onDownload={handleDownload}
      />
      
      <div className="absolute top-6 right-6 flex items-center gap-2 z-40">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full glass hover:scale-105 transition-all"
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode
            ? <Sun size={18} className="text-yellow-400" />
            : <Moon size={18} className="text-indigo-500" />}
        </button>
        
        <button 
          onClick={leaveRoom}
          className="p-2 rounded-full glass hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 hover:scale-105 transition-all"
          title="Leave Room"
        >
          <LogOut size={18} />
        </button>
      </div>

      <LiveCursors cursors={cursors} />
      
      <div className="absolute inset-0 z-10 transition-cursor duration-150">
        <canvas ref={canvasRef} />
      </div>

      <div className="absolute bottom-6 left-6 z-40">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass text-xs font-semibold text-gray-800 dark:text-gray-100">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: userColor }}></div>
          <span className="opacity-60 text-gray-500 dark:text-gray-400">Room:</span>
          <span className="font-mono font-bold tracking-wider">{roomId}</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {showUsersList && (
          <div className="glass p-3 rounded-2xl min-w-[200px] mb-2 animate-in slide-in-from-bottom-2 duration-200">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 px-1 text-gray-800 dark:text-gray-100">Online Users</h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {onlineUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm border border-black/10 dark:border-white/10" 
                    style={{ backgroundColor: user.color || '#fff' }}
                  ></div>
                  <span className="text-sm font-medium opacity-80 text-gray-800 dark:text-gray-100">{user.username} {user.username === username ? '(You)' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowUsersList(!showUsersList)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg text-gray-800 dark:text-gray-100 ${showUsersList ? 'bg-indigo-50 darker:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-black/10 dark:ring-white/20' : ''}`}
        >
          <div className="relative">
            <Users size={20} className={showUsersList ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1e1e2d] animate-pulse"></span>
          </div>
          <span className="tracking-tight">Online</span>
          <div className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-[11px] font-black">
            {onlineUsers.length}
          </div>
        </button>
      </div>
    </div>
  );
}
