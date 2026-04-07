import { useState } from 'react';
import Arena from './components/Arena';
import type { GraphData } from './lib/GraphEngine';

function App() {
  const [player1Graph, setPlayer1Graph] = useState<GraphData | null>(null);
  const [player2Graph, setPlayer2Graph] = useState<GraphData | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col items-center">
      <header className="mb-8 text-center space-y-4">
        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
          Graph Gladiators: Battle of Structures
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Create, analyze, and battle! Will a dense structural core defeat a stable tree?
        </p>
      </header>

      <main className="w-full max-w-7xl flex flex-col items-center gap-8">
        <Arena player1Graph={player1Graph} player2Graph={player2Graph} onPlayer1Change={setPlayer1Graph} onPlayer2Change={setPlayer2Graph} />
      </main>
    </div>
  );
}

export default App;
