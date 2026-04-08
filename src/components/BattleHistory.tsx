import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BattleRecord } from '../lib/battleHistory';

interface Props {
    records: BattleRecord[];
    onClear: () => void;
}

export default function BattleHistory({ records, onClear }: Props) {
    const [open, setOpen] = useState(false);

    if (records.length === 0 && !open) return null;

    return (
        <div className="w-full max-w-7xl mt-2">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
            >
                <span>{open ? '▼' : '▶'}</span>
                Battle History
                {records.length > 0 && (
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                        {records.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 bg-slate-900 border border-slate-700 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                                    Recent Battles
                                </h3>
                                {records.length > 0 && (
                                    <button
                                        onClick={onClear}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {records.length === 0 ? (
                                <p className="text-slate-500 text-sm italic">No battles recorded yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                                    {records.map(record => (
                                        <div
                                            key={record.id}
                                            className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 text-sm"
                                        >
                                            <span className="text-slate-500 text-xs w-16 shrink-0">
                                                {new Date(record.timestamp).toLocaleDateString()}
                                            </span>
                                            <div className={`flex-1 text-right ${record.winner === 1 ? 'text-blue-300 font-bold' : 'text-slate-400'}`}>
                                                P1 — {record.p1Nodes}V / {record.p1Edges}E
                                                <span className="ml-1 text-white">({record.p1Score.toFixed(0)})</span>
                                            </div>
                                            <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${record.winner === 0 ? 'bg-slate-600 text-slate-300' : record.winner === 1 ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>
                                                {record.winner === 0 ? 'TIE' : record.winner === 1 ? 'P1 ✓' : 'P2 ✓'}
                                            </div>
                                            <div className={`flex-1 ${record.winner === 2 ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
                                                P2 — {record.p2Nodes}V / {record.p2Edges}E
                                                <span className="ml-1 text-white">({record.p2Score.toFixed(0)})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

