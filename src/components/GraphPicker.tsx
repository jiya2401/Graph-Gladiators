import { useState } from 'react';
import { GraphEngine } from '../lib/GraphEngine';
import type { GraphData } from '../lib/GraphEngine';
import { GraphFactory } from '../lib/GraphFactory';
import ForceGraph2D from 'react-force-graph-2d';
import GraphBuilder from './GraphBuilder';

type Tab = 'preset' | 'draw';

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
    const [tab, setTab] = useState<Tab>('preset');

    const handlePreset = (type: string) => {
        let newGraph: GraphData | null = null;
        if (type === 'Tree') newGraph = GraphFactory.createTree(nodesCount);
        if (type === 'Cyclic') newGraph = GraphFactory.createCyclic(nodesCount);
        if (type === 'Dense') newGraph = GraphFactory.createDense(nodesCount);
        if (type === 'Star') newGraph = GraphFactory.createStar(nodesCount);
        if (type === 'Random') newGraph = GraphFactory.createRandom(nodesCount);

        if (newGraph) {
            // Apply player color to nodes
            newGraph.nodes.forEach(n => (n.color = color));
            onChange(newGraph);
        }
    };

    const engine = selectedGraph ? new GraphEngine(selectedGraph) : null;
    const stats = engine?.analyze();

    return (
        <div className="flex flex-col gap-3 h-full relative z-10">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setTab('preset')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${tab === 'preset' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Preset Graphs
                </button>
                <button
                    onClick={() => setTab('draw')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${tab === 'draw' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    ✏ Draw Custom
                </button>
            </div>

            {tab === 'preset' && (
                <>
                    <div className="flex flex-wrap gap-2">
                        {(['Tree', 'Cyclic', 'Dense', 'Star', 'Random'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => handlePreset(t)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-semibold transition-colors"
                                style={{ borderColor: color }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">Node Count:</span>
                        <input
                            type="range"
                            min="4" max="30"
                            value={nodesCount}
                            onChange={e => setNodesCount(Number(e.target.value))}
                            className="w-32 accent-blue-500"
                        />
                        <span className="text-white font-bold w-6">{nodesCount}</span>
                    </div>

                    {/* Force-graph visualization for preset graphs */}
                    <div className="flex-1 bg-black/40 rounded-xl overflow-hidden border border-slate-800 min-h-[280px] relative">
                        {selectedGraph ? (
                            <ForceGraph2D
                                graphData={{ nodes: selectedGraph.nodes, links: selectedGraph.edges } as never}
                                nodeColor={(n: { color?: string }) => n.color ?? '#fff'}
                                nodeRelSize={6}
                                linkColor={() => 'rgba(255,255,255,0.25)'}
                                width={480}
                                height={280}
                                backgroundColor="transparent"
                                cooldownTicks={100}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic text-sm">
                                Select a graph type above to generate a structure
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === 'draw' && (
                <GraphBuilder
                    onChange={graph => {
                        // Apply player color
                        graph.nodes.forEach(n => (n.color = color));
                        onChange(graph);
                    }}
                    color={color}
                />
            )}

            {/* Metrics bar (shown in both tabs) */}
            {stats && (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="col-span-2 flex justify-between items-center border-b border-slate-700 pb-2 mb-1">
                        <span className="text-slate-400">Power Score</span>
                        <span className="text-2xl font-black text-white">{stats.powerScore.toFixed(0)}</span>
                    </div>
                    <div className="text-slate-400">Nodes: <span className="text-white">{stats.nodeCount}</span></div>
                    <div className="text-slate-400">Edges: <span className="text-white">{stats.edgeCount}</span></div>
                    <div className="text-slate-400">Density: <span className="text-white">{stats.density.toFixed(3)}</span></div>
                    <div className="text-slate-400">Centrality: <span className="text-white">{stats.avgCentrality.toFixed(3)}</span></div>
                    <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                        {stats.abilities.map(a => (
                            <span key={a} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">{a}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

