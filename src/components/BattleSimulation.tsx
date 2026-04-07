import { useEffect, useState } from 'react';
import { GraphEngine } from '../lib/GraphEngine';
import type { GraphData, GraphProperties } from '../lib/GraphEngine';
import { motion } from 'framer-motion';

export default function BattleSimulation({
    p1,
    p2,
    onReset
}: {
    p1: GraphData,
    p2: GraphData,
    onReset: () => void
}) {
    const [phase, setPhase] = useState<'loading' | 'analyzing' | 'clashing' | 'result'>('loading');
    const [p1Stats, setP1Stats] = useState<GraphProperties | null>(null);
    const [p2Stats, setP2Stats] = useState<GraphProperties | null>(null);

    const [winner, setWinner] = useState<1 | 2 | 0 | null>(null);

    useEffect(() => {
        // Simulation sequence
        setTimeout(() => {
            const engine1 = new GraphEngine(p1);
            const engine2 = new GraphEngine(p2);
            setP1Stats(engine1.analyze());
            setP2Stats(engine2.analyze());
            setPhase('analyzing');
        }, 1000);

        setTimeout(() => {
            setPhase('clashing');
        }, 3000);

        setTimeout(() => {
            // calculate winner
            const e1 = new GraphEngine(p1).analyze();
            const e2 = new GraphEngine(p2).analyze();

            const s1 = e1.powerScore;
            const s2 = e2.powerScore;

            if (s1 > s2) setWinner(1);
            else if (s2 > s1) setWinner(2);
            else setWinner(0); // tie

            setPhase('result');
        }, 5000);
    }, [p1, p2]);

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-700 rounded-3xl min-h-[600px] relative overflow-hidden">

            {/* Background FX */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/0 to-slate-900/0" />

            {phase === 'loading' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="mt-6 text-2xl font-bold text-indigo-400">Booting Simulation Core...</h2>
                </motion.div>
            )}

            {(phase === 'analyzing' || phase === 'clashing' || phase === 'result') && p1Stats && p2Stats && (
                <div className="w-full flex-1 flex flex-col justify-between">
                    <h2 className="text-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 mb-8">
                        {phase === 'analyzing' && 'Analyzing Structural Integrity...'}
                        {phase === 'clashing' && 'Graphs Clashing!'}
                        {phase === 'result' && 'Battle Concluded!'}
                    </h2>

                    <div className="flex w-full justify-between items-center gap-12 flex-1">

                        {/* Player 1 Card */}
                        <motion.div
                            animate={
                                phase === 'clashing' ? { x: [0, 50, 0, 50, 0], scale: 1.05 } :
                                    phase === 'result' ? (winner === 1 ? { scale: 1.2 } : { opacity: 0.5, filter: 'grayscale(100%)' })
                                        : {}
                            }
                            transition={{ duration: phase === 'clashing' ? 0.3 : 0.5, repeat: phase === 'clashing' ? 6 : 0 }}
                            className={`flex-1 p-8 rounded-2xl border-2 ${winner === 1 ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] bg-blue-900/30' : 'border-slate-700 bg-slate-800'}`}
                        >
                            <h3 className="text-2xl font-bold text-blue-400 mb-4">Player 1 Structure</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Raw Power Score</span>
                                    <span className="text-4xl font-black text-white">{p1Stats.powerScore.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Node Density</span>
                                    <span className="font-mono">{p1Stats.density.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Stability (Tree)</span>
                                    <span className="font-mono">{p1Stats.isTree ? 'High' : 'Low'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Clash Icon */}
                        {phase !== 'result' && (
                            <motion.div
                                animate={phase === 'clashing' ? { scale: [1, 2, 1], rotate: [0, 180, 360] } : {}}
                                transition={{ duration: 0.5, repeat: phase === 'clashing' ? Infinity : 0 }}
                                className="text-6xl font-black italic text-pink-500 z-10 drop-shadow-[0_0_20px_rgba(236,72,153,1)]"
                            >
                                VS
                            </motion.div>
                        )}
                        {phase === 'result' && winner === 0 && (
                            <div className="text-6xl font-black italic text-slate-400 z-10">TIE</div>
                        )}

                        {/* Player 2 Card */}
                        <motion.div
                            animate={
                                phase === 'clashing' ? { x: [0, -50, 0, -50, 0], scale: 1.05 } :
                                    phase === 'result' ? (winner === 2 ? { scale: 1.2 } : { opacity: 0.5, filter: 'grayscale(100%)' })
                                        : {}
                            }
                            transition={{ duration: phase === 'clashing' ? 0.3 : 0.5, repeat: phase === 'clashing' ? 6 : 0 }}
                            className={`flex-1 p-8 rounded-2xl border-2 ${winner === 2 ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-red-900/30' : 'border-slate-700 bg-slate-800'}`}
                        >
                            <h3 className="text-2xl font-bold text-red-400 mb-4">Player 2 Structure</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Raw Power Score</span>
                                    <span className="text-4xl font-black text-white">{p2Stats.powerScore.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Node Density</span>
                                    <span className="font-mono">{p2Stats.density.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Stability (Tree)</span>
                                    <span className="font-mono">{p2Stats.isTree ? 'High' : 'Low'}</span>
                                </div>
                            </div>
                        </motion.div>

                    </div>

                    {phase === 'result' && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-12 text-center">
                            <h2 className="text-5xl font-black mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                {winner === 1 ? 'Player 1 Wins!' : winner === 2 ? 'Player 2 Wins!' : 'Mutual Destruction!'}
                            </h2>
                            <button
                                onClick={onReset}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-bold uppercase tracking-wider transition-colors"
                            >
                                Return to Arena
                            </button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
