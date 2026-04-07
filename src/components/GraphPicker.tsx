import { useState } from 'react';
import { GraphEngine } from '../lib/GraphEngine';
import type { GraphData } from '../lib/GraphEngine';
import { GraphFactory } from '../lib/GraphFactory';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphPicker({
    selectedGraph,
    onChange,
    color
}: {
    selectedGraph: GraphData | null,
    onChange: (g: GraphData) => void,
    color: string
}) {
    const [nodesCount, setNodesCount] = useState(8);

    const handleSelect = (type: string) => {
        let newGraph: GraphData | null = null;
        if (type === 'Tree') newGraph = GraphFactory.createTree(nodesCount);
        if (type === 'Cyclic') newGraph = GraphFactory.createCyclic(nodesCount);
        if (type === 'Dense') newGraph = GraphFactory.createDense(nodesCount);
        if (type === 'Star') newGraph = GraphFactory.createStar(nodesCount);

        if (newGraph) {
            // Decorate with color
            newGraph.nodes.forEach(n => n.color = color);
            onChange(newGraph);
        }
    };

    const engine = selectedGraph ? new GraphEngine(selectedGraph) : null;
    const stats = engine?.analyze();

    return (
        <div className="flex flex-col gap-4 h-full relative z-10">
            <div className="flex flex-wrap gap-2">
                {['Tree', 'Cyclic', 'Dense', 'Star'].map(t => (
                    <button
                        key={t}
                        onClick={() => handleSelect(t)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-semibold transition-colors"
                        style={{ borderColor: color }}
                    >
                        {t} Graph
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 text-sm mt-2">
                Node Count (Complexity):
                <input
                    type="range"
                    min="4" max="30"
                    value={nodesCount}
                    onChange={e => setNodesCount(Number(e.target.value))}
                    className="w-32 accent-blue-500"
                />
                <span>{nodesCount}</span>
            </div>

            <div className="flex-1 bg-black/40 rounded-xl overflow-hidden border border-slate-800 min-h-[300px] relative">
                {selectedGraph ? (
                    <ForceGraph2D
                        graphData={{ nodes: selectedGraph.nodes, links: selectedGraph.edges }}
                        nodeColor={n => n.color || '#fff'}
                        nodeRelSize={6}
                        linkColor={() => 'rgba(255,255,255,0.2)'}
                        width={480} // Can be responsive later using AutoSizer
                        height={350}
                        backgroundColor="transparent"
                        cooldownTicks={100}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">
                        Select a graph type to generate a structure
                    </div>
                )}
            </div>

            {stats && (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 mt-2 text-sm grid grid-cols-2 gap-2">
                    <div className="text-slate-400">Power Score: <span className="text-white font-bold text-lg">{stats.powerScore.toFixed(0)}</span></div>
                    <div className="text-slate-400">Nodes: <span className="text-white">{stats.nodeCount}</span></div>
                    <div className="text-slate-400">Edges: <span className="text-white">{stats.edgeCount}</span></div>
                    <div className="text-slate-400">Density: <span className="text-white">{stats.density.toFixed(2)}</span></div>

                    <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                        {stats.abilities.map(a => (
                            <span key={a} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">{a}</span>
                        ))}
                        {stats.isTree && <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Tree</span>}
                        {stats.hasCycles && <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">Cyclic</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
