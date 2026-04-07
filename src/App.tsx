import { useState } from 'react';
import type { GraphData } from './lib/GraphEngine';
import { loadHistory, saveRecord, clearHistory } from './lib/battleHistory';
import type { BattleRecord } from './lib/battleHistory';
import Arena from './components/Arena';
import BattleHistory from './components/BattleHistory';

function App() {
    const [player1Graph, setPlayer1Graph] = useState<GraphData | null>(null);
    const [player2Graph, setPlayer2Graph] = useState<GraphData | null>(null);
    const [history, setHistory] = useState<BattleRecord[]>(() => loadHistory());

    const handleBattleComplete = () => {
        setHistory(loadHistory());
    };

    const handleBattleSave = (record: BattleRecord) => {
        saveRecord(record);
        setHistory(loadHistory());
    };

    const handleClearHistory = () => {
        clearHistory();
        setHistory([]);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col items-center">
            <header className="mb-8 text-center space-y-3">
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                    Graph Gladiators: Battle of Structures
                </h1>
                <p className="text-slate-400 text-base max-w-2xl mx-auto">
                    Create or draw graphs, then battle them using graph-theory algorithms.
                    The structure with the higher power score wins!
                </p>
            </header>

            <main className="w-full max-w-7xl flex flex-col items-center gap-8">
                <Arena
                    player1Graph={player1Graph}
                    player2Graph={player2Graph}
                    onPlayer1Change={setPlayer1Graph}
                    onPlayer2Change={setPlayer2Graph}
                    onBattleComplete={handleBattleComplete}
                    onBattleSave={handleBattleSave}
                />
                <BattleHistory records={history} onClear={handleClearHistory} />
            </main>

            <footer className="mt-12 text-slate-700 text-xs">
                Graph Gladiators · React + Node.js + Python/NetworkX
            </footer>
        </div>
    );
}

export default App;


