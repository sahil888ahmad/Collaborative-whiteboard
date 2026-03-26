import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown,
  MousePointer2,
  Pen, 
  Highlighter,
  PenTool,
  Eraser, 
  Scissors,
  Square, 
  Circle,
  Triangle,
  Minus as LineIcon,
  Type, 
  Smile,
  Undo, 
  Redo, 
  Trash2, 
  Download,
  Palette
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PRIMARY_TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'text', icon: Type, label: 'Text' },
];

const SECONDARY_TOOLS = [
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'line', icon: LineIcon, label: 'Line' },
  { id: 'dash', icon: PenTool, label: 'Dashed Pen' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
  { id: 'eraser_object', icon: Scissors, label: 'Obj Eraser' },
  { id: 'emoji', icon: Smile, label: 'Emoji' },
];

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#000000', '#ffffff'
];

const EMOJIS = ['😀', '😂', '❤️', '🔥', '✨', '👍', '🎉', '💡', '✅', '❌'];

export default function Toolbar({ 
  currentTool, 
  setCurrentTool, 
  color, 
  setColor, 
  brushSize, 
  setBrushSize,
  eraserSize,
  setEraserSize,
  selectedEmoji,
  setSelectedEmoji,
  onUndo,
  onRedo,
  onClear,
  onDownload
}) {
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const moreButtonRef = useRef(null);
  
  const activeSecondaryTool = SECONDARY_TOOLS.find(t => t.id === currentTool);

  // Calculate dropdown position relative to viewport
  const openDropdown = () => {
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setShowMoreTools(true);
  };

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowMoreTools(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      {/* ===== TOOLBAR PILL ===== */}
      <div className="toolbar-pill absolute top-6 left-1/2 -translate-x-1/2 flex items-center p-1.5 z-40 rounded-full w-max max-w-[96vw] overflow-x-auto [&::-webkit-scrollbar]:hidden transition-all duration-300">
        
        {/* Primary Tools */}
        <div className="flex items-center gap-0.5 mx-1 flex-shrink-0">
          {PRIMARY_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setCurrentTool(tool.id)}
              className={cn(
                "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center relative group",
                currentTool === tool.id 
                  ? "tool-active" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100"
              )}
              title={tool.label}
            >
              <tool.icon size={19} />
              <span className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 text-[10px] bg-gray-900 dark:bg-gray-700 text-white px-2 py-0.5 rounded-lg transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {tool.label}
              </span>
            </button>
          ))}

          {/* More Tools Button */}
          <button 
            ref={moreButtonRef}
            onClick={openDropdown}
            className={cn(
              "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-0.5 relative group",
              activeSecondaryTool 
                ? "tool-active" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100"
            )}
            title="More Tools"
          >
            {activeSecondaryTool 
              ? <activeSecondaryTool.icon size={19} /> 
              : <><ChevronDown size={15} /><span className="text-xs font-bold pr-0.5">More</span></>
            }
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-gray-200 dark:bg-gray-700 mx-1.5 flex-shrink-0" />

        {/* Attributes: Color OR Emoji */}
        <div className="flex items-center gap-2 flex-shrink-0 mx-1">
          {currentTool === 'emoji' ? (
            /* Emoji Strip */
            <div className="flex items-center gap-1">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-lg transition-all hover:-translate-y-0.5 hover:scale-110 rounded-lg",
                    selectedEmoji === e ? "bg-white dark:bg-gray-700 shadow-md scale-110" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => setSelectedEmoji(e)}
                  title={e}
                >
                  {e}
                </button>
              ))}
            </div>
          ) : (
            /* Color Strip */
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all hover:-translate-y-0.5 hover:scale-110 shadow-sm border border-black/10 dark:border-white/10",
                    color === c ? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-gray-900 scale-110" : ""
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
              
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
              
              {/* Custom Color Picker */}
              <label
                className="relative w-7 h-7 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-sm overflow-hidden hover:scale-110 hover:-translate-y-0.5"
                title="Custom Color"
              >
                <div className="absolute inset-0" style={{ backgroundColor: color }} />
                <Palette size={13} className="text-white mix-blend-difference z-10" />
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          )}

          {/* Size Slider */}
          <div className="flex items-center gap-1.5 ml-1">
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
            <input 
              type="range"
              min="1"
              max={currentTool === 'eraser' ? 100 : 50}
              value={currentTool === 'eraser' ? eraserSize : brushSize}
              onChange={(e) => {
                if (currentTool === 'eraser') setEraserSize(Number(e.target.value));
                else setBrushSize(Number(e.target.value));
              }}
              className="w-20 cursor-pointer"
              title={`${currentTool === 'eraser' ? 'Eraser' : 'Brush'} Size: ${currentTool === 'eraser' ? eraserSize : brushSize}`}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-gray-200 dark:bg-gray-700 mx-1.5 flex-shrink-0" />

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0 mx-1">
          <button onClick={onUndo} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all" title="Undo">
            <Undo size={18} />
          </button>
          <button onClick={onRedo} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all" title="Redo">
            <Redo size={18} />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
          <button onClick={onClear} className="p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-all" title="Clear Board">
            <Trash2 size={18} />
          </button>
          <button onClick={onDownload} className="p-2.5 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-400 hover:text-violet-600 transition-all" title="Download PNG">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* ===== MORE TOOLS DROPDOWN (fixed, escapes overflow clipping) ===== */}
      {showMoreTools && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMoreTools(false)}
          />
          {/* Dropdown panel — fixed position so it escapes any overflow */}
          <div
            className="fixed z-50 bg-white/97 dark:bg-gray-900/97 backdrop-blur-2xl p-3 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-white/10 grid grid-cols-4 gap-1.5"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {SECONDARY_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setCurrentTool(tool.id);
                  setShowMoreTools(false);
                }}
                className={cn(
                  "p-3 rounded-xl transition-all duration-150 flex flex-col items-center justify-center gap-1.5 min-w-[64px]",
                  currentTool === tool.id 
                    ? "tool-active" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <tool.icon size={22} />
                <span className="text-[10px] whitespace-nowrap font-medium">{tool.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
