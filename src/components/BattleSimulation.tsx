import { useEffect, useState } from 'react';
import { GraphEngine } from '../lib/GraphEngine';
import type { GraphData, GraphProperties } from '../lib/GraphEngine';
import { motion } from 'framer-motion';
import type { BattleRecord } from '../lib/battleHistory';

// Extended stats that may come from Python backend
interface ExtendedStats extends GraphProperties {
    shortestPathAvg?: number;
    explanation?: string;
}

interface BattleResult {
    graph1Stats: ExtendedStats;
    graph2Stats: ExtendedStats;
    winner: 0 | 1 | 2;
    explanation: string;
}

/** Call the Node.js backend to run the battle via Python/NetworkX */
async function fetchBattleResult(p1: GraphData, p2: GraphData): Promise<BattleResult> {
    const res = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph1: p1, graph2: p2 }),
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json() as Promise<BattleResult>;
}

/** Client-side fallback when the backend is unavailable */
function computeClientSide(p1: GraphData, p2: GraphData): BattleResult {
    const s1 = new GraphEngine(p1).analyze();
    const s2 = new GraphEngine(p2).analyze();
    let winner: 0 | 1 | 2 = 0;
    let explanation = `Both graphs tied at ${s1.powerScore.toFixed(0)} points!`;
    if (s1.powerScore > s2.powerScore) {
        winner = 1;
        explanation = `Player 1 wins by ${(s1.powerScore - s2.powerScore).toFixed(0)} points (client-side analysis)!`;
    } else if (s2.powerScore > s1.powerScore) {
        winner = 2;
        explanation = `Player 2 wins by ${(s2.powerScore - s1.powerScore).toFixed(0)} points (client-side analysis)!`;
    }
    return { graph1Stats: s1, graph2Stats: s2, winner, explanation };
}

// ──────────────────────────────────────────────────────────────────────────────

export default function BattleSimulation({
    p1,
    p2,
    onReset,
    onBattleComplete,
    onBattleSave,
}: {
    p1: GraphData;
    p2: GraphData;
    onReset: () => void;
    onBattleComplete?: () => void;
    onBattleSave?: (record: BattleRecord) => void;
}) {
    const [phase, setPhase] = useState<'loading' | 'analyzing' | 'clashing' | 'result'>('loading');
    const [result, setResult] = useState<BattleResult | null>(null);
    const [analysisSource, setAnalysisSource] = useState<'python' | 'client'>('client');

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            // Step 1 – brief boot animation
            await delay(800);
            if (cancelled) return;

            // Step 2 – fetch results (Python backend or client fallback)
            let battleResult: BattleResult;
            try {
                battleResult = await fetchBattleResult(p1, p2);
                setAnalysisSource('python');
            } catch {
                battleResult = computeClientSide(p1, p2);
                setAnalysisSource('client');
            }

            if (cancelled) return;
            setResult(battleResult);
            setPhase('analyzing');

            // Step 3 – clash animation
            await delay(2000);
            if (cancelled) return;
            setPhase('clashing');

            // Step 4 – show result
            await delay(2000);
            if (cancelled) return;
            setPhase('result');

            // Build and save battle record via parent callback
            const record: BattleRecord = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                p1Nodes: battleResult.graph1Stats.nodeCount,
                p1Edges: battleResult.graph1Stats.edgeCount,
                p1Score: battleResult.graph1Stats.powerScore,
                p2Nodes: battleResult.graph2Stats.nodeCount,
                p2Edges: battleResult.graph2Stats.edgeCount,
                p2Score: battleResult.graph2Stats.powerScore,
                winner: battleResult.winner,
                explanation: battleResult.explanation,
            };
            onBattleSave?.(record);
            onBattleComplete?.();
        };

        run();
        return () => { cancelled = true; };
    }, [p1, p2, onBattleComplete, onBattleSave]);

    const winner = result?.winner ?? null;
    const p1Stats = result?.graph1Stats ?? null;
    const p2Stats = result?.graph2Stats ?? null;

    return (
        <div className="w-full flex flex-col items-center p-6 bg-slate-900 border border-slate-700 rounded-3xl min-h-[580px] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.08)_0%,_transparent_70%)] pointer-events-none" />

            {/* Loading */}
            {phase === 'loading' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center mt-20"
                >
                    <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <h2 className="mt-6 text-2xl font-bold text-indigo-400">Booting Simulation Core…</h2>
                    <p className="mt-2 text-slate-500 text-sm">Connecting to analysis engine</p>
                </motion.div>
            )}

            {/* Analyzing / Clashing / Result */}
            {(phase === 'analyzing' || phase === 'clashing' || phase === 'result') && p1Stats && p2Stats && (
                <div className="w-full flex flex-col gap-6">
                    {/* Phase title */}
                    <h2 className="text-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
                        {phase === 'analyzing' && 'Analyzing Structural Integrity…'}
                        {phase === 'clashing' && '⚔ Graphs Clashing!'}
                        {phase === 'result' && '🏆 Battle Concluded!'}
                    </h2>

                    {/* Analysis source badge */}
                    <div className="text-center">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${analysisSource === 'python' ? 'bg-green-900/60 text-green-400' : 'bg-yellow-900/60 text-yellow-400'}`}>
                            {analysisSource === 'python' ? '🐍 Python/NetworkX analysis' : '⚡ Client-side analysis (start backend for NetworkX)'}
                        </span>
                    </div>

                    {/* Player cards */}
                    <div className="flex w-full gap-6 items-stretch">
                        <PlayerCard
                            label="Player 1"
                            stats={p1Stats}
                            isWinner={winner === 1}
                            isLoser={winner !== null && winner !== 0 && winner !== 1}
                            phase={phase}
                            side={1}
                        />

                        {/* VS / clash icon */}
                        <div className="flex flex-col items-center justify-center px-2 shrink-0">
                            {phase !== 'result' ? (
                                <motion.div
                                    animate={phase === 'clashing' ? { scale: [1, 1.6, 1], rotate: [0, 180, 360] } : {}}
                                    transition={{ duration: 0.6, repeat: phase === 'clashing' ? Infinity : 0 }}
                                    className="text-4xl font-black italic text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,1)]"
                                >
                                    VS
                                </motion.div>
                            ) : winner === 0 ? (
                                <div className="text-3xl font-black italic text-slate-400">TIE</div>
                            ) : null}
                        </div>

                        <PlayerCard
                            label="Player 2"
                            stats={p2Stats}
                            isWinner={winner === 2}
                            isLoser={winner !== null && winner !== 0 && winner !== 2}
                            phase={phase}
                            side={2}
                        />
                    </div>

                    {/* Result banner */}
                    {phase === 'result' && (
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center flex flex-col items-center gap-3"
                        >
                            <h2 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                {winner === 1 ? 'Player 1 Wins!' : winner === 2 ? 'Player 2 Wins!' : 'Mutual Destruction!'}
                            </h2>
                            {result?.explanation && (
                                <p className="text-slate-400 text-sm max-w-lg">{result.explanation}</p>
                            )}
                            <button
                                onClick={onReset}
                                className="mt-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-bold uppercase tracking-wider transition-colors"
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

// ──────────────────────────────────────────────────────────────────────────────
// Player stats card
// ──────────────────────────────────────────────────────────────────────────────

function PlayerCard({
    label,
    stats,
    isWinner,
    isLoser,
    phase,
    side,
}: {
    label: string;
    stats: ExtendedStats;
    isWinner: boolean;
    isLoser: boolean;
    phase: string;
    side: 1 | 2;
}) {
    const color = side === 1 ? 'blue' : 'red';
    const borderClass = isWinner
        ? `border-${color}-500 shadow-[0_0_30px_rgba(${side === 1 ? '59,130,246' : '239,68,68'},0.5)] bg-${color}-900/20`
        : 'border-slate-700 bg-slate-800';

    return (
        <motion.div
            animate={
                phase === 'clashing'
                    ? { x: side === 1 ? [0, 30, 0, 30, 0] : [0, -30, 0, -30, 0], scale: 1.03 }
                    : phase === 'result'
                        ? isWinner
                            ? { scale: 1.05 }
                            : isLoser
                                ? { opacity: 0.5, filter: 'grayscale(80%)' }
                                : {}
                        : {}
            }
            transition={{ duration: phase === 'clashing' ? 0.25 : 0.5, repeat: phase === 'clashing' ? 4 : 0 }}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all ${borderClass}`}
        >
            <h3 className={`text-xl font-bold mb-4 text-${color}-400`}>{label}</h3>

            {/* Score */}
            <div className="flex justify-between items-end border-b border-slate-700 pb-3 mb-3">
                <span className="text-slate-400 text-sm">Power Score</span>
                <span className="text-4xl font-black text-white">{stats.powerScore.toFixed(0)}</span>
            </div>

            {/* Core metrics */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
                <Metric label="Nodes" value={stats.nodeCount} />
                <Metric label="Edges" value={stats.edgeCount} />
                <Metric label="Density" value={stats.density.toFixed(3)} />
                <Metric label="Centrality" value={stats.avgCentrality.toFixed(3)} />
                <Metric label="Connected" value={stats.isConnected ? '✓ Yes' : '✗ No'} highlight={stats.isConnected} />
                <Metric label="Cycles" value={stats.hasCycles ? '✓ Yes' : '✗ No'} />
                {stats.shortestPathAvg !== undefined && stats.shortestPathAvg > 0 && (
                    <Metric label="Avg Path" value={stats.shortestPathAvg.toFixed(2)} />
                )}
            </div>

            {/* Ability tags */}
            {stats.abilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {stats.abilities.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 text-xs rounded-full">{a}</span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function Metric({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
    return (
        <>
            <span className="text-slate-400">{label}</span>
            <span className={`font-mono text-right ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</span>
        </>
    );
}

function delay(ms: number) {
    return new Promise<void>(res => setTimeout(res, ms));
}

