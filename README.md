# 🎨 Collaborative Whiteboard

A real-time collaborative whiteboard web application where multiple users can draw together simultaneously.

## ✨ Features

- **Real-time Collaboration** — Multiple users draw on the same board via WebSockets (Socket.io)
- **Rich Drawing Tools** — Pen, Dashed Pen, Highlighter, Eraser, Object Eraser, Rectangle, Circle, Triangle, Line, Text, Emoji
- **Smart Cursors** — Cursor shape dynamically matches the selected tool, color, and size
- **Color Picker** — Quick preset colors + full native color wheel
- **Undo / Redo** — Full history stack with cross-client sync
- **Room System** — Join via unique Room ID; share to collaborate
- **Live Cursors** — See other users' cursors moving in real time with name labels
- **Dark / Light Mode** — Toggle between themes
- **Export** — Download the whiteboard as a PNG
- **Responsive UI** — Modern pill toolbar that works on all screen sizes

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS v4     |
| Canvas    | Fabric.js v7                        |
| Icons     | Lucide React                        |
| Backend   | Node.js, Express                    |
| Realtime  | Socket.io                           |

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sahil888ahmad/Collaborative-whiteboard.git
cd Collaborative-whiteboard
```

### 2. Start the Backend
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:3001
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Test Collaboration
1. Open `http://localhost:5173` in **two browser windows**
2. Enter the **same Room ID** in both windows
3. Start drawing — changes sync instantly!

## 📁 Project Structure

```
Collaborative-whiteboard/
├── backend/
│   ├── server.js          # Express + Socket.io server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Whiteboard.jsx    # Main canvas + Fabric.js logic
│   │   │   ├── Toolbar.jsx       # Drawing tools UI
│   │   │   ├── RoomOverlay.jsx   # Room join screen
│   │   │   └── LiveCursors.jsx   # Remote cursor rendering
│   │   ├── lib/
│   │   │   └── socket.js         # Socket.io client
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 📜 License

MIT
