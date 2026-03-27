import React, { useState } from 'react';
import { 
  Square, Circle, Triangle as TriIcon, Type, MousePointer2, 
  Pencil, Eraser, Highlighter, LayoutGrid, 
  Trash2, Download, Undo2, Redo2, 
  Minus, Smile, Palette, Settings2
} from 'lucide-react';

const EMOJIS = ['😀', '🔥', '❤️', '🚀', '✨', '⭐', '🎨', '🎉', '💡', '✅'];

interface ToolbarProps {
  currentTool: string;
  setCurrentTool: (tool: string) => void;
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  eraserSize: number;
  setEraserSize: (size: number) => void;
  selectedEmoji: string;
  setSelectedEmoji: (emoji: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownload: () => void;
}

export default function Toolbar({
  currentTool, setCurrentTool,
  color, setColor,
  brushSize, setBrushSize,
  eraserSize, setEraserSize,
  selectedEmoji, setSelectedEmoji,
  onUndo, onRedo, onClear, onDownload
}: ToolbarProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const ToolButton = ({ tool, icon: Icon, label }: any) => (
    <button
      onClick={() => {
        setCurrentTool(tool);
        setShowEmojiPicker(false);
      }}
      className={`p-2.5 rounded-xl transition-all duration-200 group relative ${
        currentTool === tool 
          ? 'tool-active' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
      }`}
      title={label}
    >
      <Icon size={20} />
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold tracking-widest uppercase">
        {label}
      </span>
    </button>
  );

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
      <div className="toolbar-pill px-2 py-2 rounded-[24px] flex items-center gap-1 shadow-2xl">
        
        {/* Selection & Drawing Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-800">
          <ToolButton tool="select" icon={MousePointer2} label="Select" />
          <ToolButton tool="pen" icon={Pencil} label="Pen" />
          <ToolButton tool="dash" icon={Minus} label="Dashed" />
          <ToolButton tool="highlighter" icon={Highlighter} label="Highlighter" />
        </div>

        {/* Shapes Group */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800">
          <ToolButton tool="rect" icon={Square} label="Rectangle" />
          <ToolButton tool="circle" icon={Circle} label="Circle" />
          <ToolButton tool="triangle" icon={TriIcon} label="Triangle" />
          <ToolButton tool="line" icon={Minus} label="Line" />
        </div>

        {/* Media & Text Group */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800">
          <ToolButton tool="text" icon={Type} label="Text" />
          
          <div className="relative">
            <button
              onClick={() => {
                setCurrentTool('emoji');
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                currentTool === 'emoji' 
                  ? 'tool-active' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 glass p-2 rounded-2xl flex flex-wrap gap-1 w-40 shadow-2xl animate-fade-in-scale">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => {
                      setSelectedEmoji(e);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedEmoji === e ? 'bg-indigo-100 dark:bg-indigo-900/40 scale-110' : ''}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Eraser Tools */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800">
          <ToolButton tool="eraser" icon={Eraser} label="Eraser" />
          <ToolButton tool="eraser_object" icon={LayoutGrid} label="Object Eraser" />
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1 pl-2">
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 ${showSettings ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              title="Settings"
            >
              <Settings2 size={20} />
            </button>
            
            {showSettings && (
              <div className="absolute top-16 right-0 glass p-5 rounded-3xl w-64 shadow-2xl animate-fade-in-scale space-y-4">
                {/* Color Picker Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette size={14} className="opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Brush Color</span>
                  </div>
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none"
                  />
                </div>

                {/* Size Sliders */}
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Brush Size</span>
                      <span className="text-[10px] font-mono font-bold opacity-60 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">{brushSize}px</span>
                    </div>
                    <input 
                      type="range" min="1" max="50" 
                      value={brushSize} 
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Eraser Size</span>
                      <span className="text-[10px] font-mono font-bold opacity-60 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">{eraserSize}px</span>
                    </div>
                    <input 
                      type="range" min="5" max="100" 
                      value={eraserSize} 
                      onChange={(e) => setEraserSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Undo/Redo & Utility */}
          <div className="flex items-center gap-0.5 ml-1">
            <button onClick={onUndo} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all active:scale-90" title="Undo"><Undo2 size={18} /></button>
            <button onClick={onRedo} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all active:scale-90" title="Redo"><Redo2 size={18} /></button>
            <button onClick={onDownload} className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500 transition-all active:scale-90" title="Export PNG"><Download size={18} /></button>
            <button onClick={onClear} className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-all active:scale-90" title="Clear Board"><Trash2 size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
