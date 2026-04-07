# Graph Gladiators: Battle of Structures

> **Two players create graphs — algorithms decide who wins.**
>
> Build directed or undirected graphs, let the system compute graph-theory metrics via Python/NetworkX, and watch animated battle simulations determine the structural champion.

---

## 📖 Project Overview

**Graph Gladiators** is a full-stack web application built for college submission that brings graph theory to life through competitive gameplay.

Each player creates a graph (by selecting a preset structure or drawing nodes and edges manually). The system analyzes both graphs using real graph-theory algorithms and assigns a **Power Score** based on node count, edge count, connectivity, density, degree centrality, and cycle detection. The graph with the higher score wins.

### Key Algorithms Used

| Algorithm | Purpose |
|-----------|---------|
| BFS | Connectivity check |
| DFS | Cycle detection |
| Dijkstra (NetworkX) | Average shortest path |
| Degree Centrality | Node influence score |
| Density formula | Edge completeness ratio |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS v4 |
| Build Tool | Vite |
| Animations | Framer Motion |
| Graph Visualization | react-force-graph-2d |
| Backend | Node.js + Express |
| Graph Analysis | Python 3 + NetworkX |
| Communication | REST API (`/analyze`, `/battle`) |

---

## 📁 Project Structure

```
Graph-Gladiators/
├── client (frontend - root of project)
│   ├── src/
│   │   ├── App.tsx                   # Root component, manages history state
│   │   ├── components/
│   │   │   ├── Arena.tsx             # Layout: two workspaces + battle button
│   │   │   ├── GraphPicker.tsx       # Preset graphs + custom Draw tab
│   │   │   ├── GraphBuilder.tsx      # SVG-based click-to-build graph editor
│   │   │   ├── BattleSimulation.tsx  # Animated battle with metrics display
│   │   │   └── BattleHistory.tsx     # Recent battles panel (localStorage)
│   │   └── lib/
│   │       ├── GraphEngine.ts        # Client-side graph analysis (fallback)
│   │       ├── GraphFactory.ts       # Preset graph generators
│   │       └── battleHistory.ts      # localStorage helpers
│   ├── index.html
│   ├── vite.config.ts                # Dev proxy: /api → localhost:3001
│   └── package.json
│
├── server/                           # Node.js backend
│   ├── server.js                     # Express server with /analyze + /battle
│   └── package.json
│
└── python/                           # Python analysis engine
    ├── analyze_graph.py              # NetworkX metrics computation
    └── requirements.txt
```

---

## ⚙️ Features

### Graph Creation
- **Preset Graphs**: Tree, Cyclic, Dense, Star, Random — with adjustable node count (4–30)
- **Custom Draw Mode**: Click-based SVG editor
  - Click canvas → add node
  - Click node → select; click second node → connect with edge
  - Toggle Directed / Undirected
  - Toggle Weighted / Unweighted (edges get labels 1–9)
  - Delete mode: click to remove nodes or edges
  - Reset button to clear the canvas

### Graph Analysis (Python/NetworkX)
- Node count, Edge count
- Connectivity (weak/strong for directed)
- Graph density: `2E / V(V-1)`
- Degree centrality for each node
- Cycle detection
- Average shortest path via Dijkstra

### Power Score Formula
```
Power Score = (nodes × 1)
            + (edges × 2)
            + (connected ? 30 : 0)
            + (density × 200)
            + (avgCentrality × 300)
            + (hasCycles ? 20 : 0)
            + (density > 0.8 ? 30 : 0)
```

### Battle System
- Compare two power scores
- Display metrics side-by-side
- Animated: loading → analyzing → clashing → result
- Winner highlighted with glow effect; loser fades to grayscale
- Human-readable explanation of outcome
- Falls back to client-side analysis if backend is offline

### Battle History
- Last 20 battles saved to `localStorage`
- Collapsible panel below the arena
- Shows: date, player stats, scores, winner
- Clear All button

---

## 🚀 Setup & Running

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18+ |
| npm | 9+ |
| Python | 3.8+ |
| pip | any recent |

---

### 1 — Install Python Dependencies

```bash
pip install -r python/requirements.txt
# or: pip3 install networkx
```

### 2 — Install & Start the Backend

```bash
cd server
npm install
npm start
# Server starts on http://localhost:3001
```

### 3 — Install & Start the Frontend

In a separate terminal, from the project root:

```bash
npm install
npm run dev
# App opens at http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the backend automatically.

### 4 — Build for Production

```bash
npm run build   # outputs to dist/
npm run preview # serves the build locally
```

---

## 🔗 API Reference

Both endpoints accept and return JSON.

### `POST /analyze`

Analyze a single graph.

**Request body:**
```json
{
  "nodes": [{"id": "n0"}, {"id": "n1"}],
  "edges": [{"source": "n0", "target": "n1", "weight": 1}],
  "directed": false,
  "weighted": false
}
```

**Response:**
```json
{
  "nodeCount": 2,
  "edgeCount": 1,
  "isConnected": true,
  "density": 1.0,
  "avgCentrality": 0.5,
  "centrality": {"n0": 1.0, "n1": 1.0},
  "hasCycles": false,
  "shortestPathAvg": 1.0,
  "powerScore": 237.0,
  "directed": false,
  "weighted": false
}
```

### `POST /battle`

Compare two graphs and determine a winner.

**Request body:**
```json
{
  "graph1": { /* GraphData */ },
  "graph2": { /* GraphData */ }
}
```

**Response:**
```json
{
  "graph1Stats": { /* metrics */ },
  "graph2Stats": { /* metrics */ },
  "winner": 1,
  "explanation": "Player 1 wins by 42.5 points (more edges, higher density)!"
}
```

---

## 🎨 UI Highlights

- **Dark theme** (`slate-950` background)
- **Gradient header** with pink/purple/red glow
- **Framer Motion** animations for battle phases
- **SVG graph editor** with real-time node/edge rendering
- **Force-directed visualization** for preset graphs

---

## 📊 Sample Output

```
Player 1: Dense Graph (12 nodes, 48 edges)
  Power Score: 287
  Density: 0.727
  Connected: Yes  |  Cycles: Yes
  Avg Centrality: 0.364

Player 2: Tree Graph (12 nodes, 11 edges)
  Power Score: 84
  Density: 0.167
  Connected: Yes  |  Cycles: No
  Avg Centrality: 0.167

🏆 Player 1 Wins by 203 points!
   (more edges, higher density, cycle bonus)
```

---

## 🧪 Extra Features

- ✅ Reset graph / draw from scratch
- ✅ Random graph generator (Erdős–Rényi model)
- ✅ Save battle history (localStorage, last 20 battles)
- ✅ Graceful offline mode (client-side fallback when backend unavailable)
- ✅ Directed and weighted graph support in both preset and draw modes

---

## 📝 Notes

- The backend uses Python's `child_process` via `spawn` to pass graph JSON to the Python script via stdin and reads results from stdout.
- The frontend works standalone (client-side analysis) even without the Node.js server.
- All TypeScript strict-mode checks pass; ESLint clean.
