import { useState } from 'react';
import type { GraphData } from '../lib/GraphEngine';
import GraphPicker from './GraphPicker';
import BattleSimulation from './BattleSimulation';

export default function Arena({
    player1Graph,
    player2Graph,
    onPlayer1Change,
    onPlayer2Change
}: {
    player1Graph: GraphData | null,
    player2Graph: GraphData | null,
    onPlayer1Change: (g: GraphData) => void,
    onPlayer2Change: (g: GraphData) => void
}) {
    const [battleStarted, setBattleStarted] = useState(false);

    const startBattle = () => {
        if (player1Graph && player2Graph) {
            setBattleStarted(true);
        }
    };

    const resetBattle = () => {
        setBattleStarted(false);
    };

    if (battleStarted && player1Graph && player2Graph) {
        return <BattleSimulation p1={player1Graph} p2={player2Graph} onReset={resetBattle} />;
    }

    return (
        <div className="w-full flex justify-between gap-6">
            {/* Player 1 Region */}
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-screen pointer-events-none" />
                <h2 className="text-3xl font-bold mb-4 text-blue-400">Player 1 Workspace</h2>
                <GraphPicker selectedGraph={player1Graph} onChange={onPlayer1Change} color="#60a5fa" />
            </div>

            {/* Center Action */}
            <div className="flex flex-col items-center justify-center gap-6 px-4">
                <div className="text-6xl font-black italic text-slate-700">VS</div>
                <button
                    onClick={startBattle}
                    disabled={!player1Graph || !player2Graph}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(219,39,119,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                >
                    Initialize Battle
                </button>
            </div>

            {/* Player 2 Region */}
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 mix-blend-screen pointer-events-none" />
                <h2 className="text-3xl font-bold mb-4 text-red-400">Player 2 Workspace</h2>
                <GraphPicker selectedGraph={player2Graph} onChange={onPlayer2Change} color="#f87171" />
            </div>
        </div>
    );
}
