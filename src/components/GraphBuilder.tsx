import { useState, useRef, useCallback } from 'react';
import type { GraphData } from '../lib/GraphEngine';

// Internal types for the builder (include x/y position for rendering)
interface BuilderNode {
    id: string;
    name: string;
    x: number;
    y: number;
}

interface BuilderEdge {
    id: string;
    source: string;
    target: string;
    weight: number;
}

interface Props {
    onChange: (graph: GraphData) => void;
    color: string;
}

export default function GraphBuilder({ onChange, color }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);

    const [nodes, setNodes] = useState<BuilderNode[]>([]);
    const [edges, setEdges] = useState<BuilderEdge[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [isDirected, setIsDirected] = useState(false);
    const [isWeighted, setIsWeighted] = useState(false);
    const [nodeCounter, setNodeCounter] = useState(1);
    const [deleteMode, setDeleteMode] = useState(false);
    // Monotonically increasing counter used to generate unique edge IDs
    const edgeCounter = useRef(0);

    // Convert SVG mouse event to SVG coordinate space
    const getSVGCoords = (e: React.MouseEvent): { x: number; y: number } => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Emit current graph state to parent whenever it changes
    const emitChange = useCallback(
        (
            curNodes: BuilderNode[],
            curEdges: BuilderEdge[],
            directed: boolean,
            weighted: boolean
        ) => {
            onChange({
                nodes: curNodes.map(n => ({ id: n.id, name: n.name, color })),
                edges: curEdges.map(e => ({
                    source: e.source,
                    target: e.target,
                    directed,
                    weight: e.weight,
                })),
                directed,
                weighted,
            });
        },
        [onChange, color]
    );

    // Click on SVG background → add a new node
    const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target !== svgRef.current) return;
        if (deleteMode) return;

        const { x, y } = getSVGCoords(e);
        const id = `n${nodeCounter}`;
        const newNode: BuilderNode = { id, name: `N${nodeCounter}`, x, y };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        setNodeCounter(c => c + 1);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        emitChange(newNodes, edges, isDirected, isWeighted);
    };

    // Click on a node → select it (first click) or add edge (second click)
    const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();

        if (deleteMode) {
            // Remove this node and all its connected edges
            const newNodes = nodes.filter(n => n.id !== nodeId);
            const newEdges = edges.filter(
                ed => ed.source !== nodeId && ed.target !== nodeId
            );
            setNodes(newNodes);
            setEdges(newEdges);
            setSelectedNodeId(null);
            emitChange(newNodes, newEdges, isDirected, isWeighted);
            return;
        }

        if (selectedNodeId === null) {
            // Select this node
            setSelectedNodeId(nodeId);
            setSelectedEdgeId(null);
        } else if (selectedNodeId === nodeId) {
            // Deselect
            setSelectedNodeId(null);
        } else {
            // Add edge from selectedNode → this node (if it doesn't exist)
            const duplicate = edges.some(
                ed =>
                    (ed.source === selectedNodeId && ed.target === nodeId) ||
                    (!isDirected && ed.source === nodeId && ed.target === selectedNodeId)
            );
            if (!duplicate) {
                // Use a counter-based ID to avoid calling Date.now() or Math.random() during handler
                const seq = ++edgeCounter.current;
                const edgeId = `${selectedNodeId}-${nodeId}-${seq}`;
                // Deterministic weight based on counter (cycles 1–9 for variety)
                const weight = isWeighted ? (seq % 9) + 1 : 1;
                const newEdge: BuilderEdge = {
                    id: edgeId,
                    source: selectedNodeId,
                    target: nodeId,
                    weight,
                };
                const newEdges = [...edges, newEdge];
                setEdges(newEdges);
                emitChange(nodes, newEdges, isDirected, isWeighted);
            }
            setSelectedNodeId(null);
        }
    };

    // Click on an edge → select or delete it
    const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
        e.stopPropagation();
        if (deleteMode) {
            const newEdges = edges.filter(ed => ed.id !== edgeId);
            setEdges(newEdges);
            setSelectedEdgeId(null);
            emitChange(nodes, newEdges, isDirected, isWeighted);
            return;
        }
        setSelectedEdgeId(prev => (prev === edgeId ? null : edgeId));
        setSelectedNodeId(null);
    };

    // Toggle directed mode
    const toggleDirected = () => {
        const newDir = !isDirected;
        setIsDirected(newDir);
        setSelectedNodeId(null);
        emitChange(nodes, edges, newDir, isWeighted);
    };

    // Toggle weighted mode
    const toggleWeighted = () => {
        const newW = !isWeighted;
        setIsWeighted(newW);
        emitChange(nodes, edges, isDirected, newW);
    };

    // Reset the entire graph
    const handleReset = () => {
        setNodes([]);
        setEdges([]);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setNodeCounter(1);
        setDeleteMode(false);
        onChange({ nodes: [], edges: [], directed: isDirected, weighted: isWeighted });
    };

    const getNode = (id: string) => nodes.find(n => n.id === id);

    // Unique arrow marker id per color to avoid SVG id conflicts
    const markerId = `arrow-builder-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <div className="flex flex-col gap-2">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    onClick={() => { setDeleteMode(false); }}
                    className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${!deleteMode ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                    ✚ Add / Connect
                </button>
                <button
                    onClick={() => { setDeleteMode(true); setSelectedNodeId(null); }}
                    className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${deleteMode ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                    ✕ Delete
                </button>
                <button
                    onClick={toggleDirected}
                    className={`px-3 py-1 text-xs rounded-md font-semibold border transition-colors ${isDirected ? 'border-purple-500 text-purple-300 bg-purple-950/50' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}
                >
                    {isDirected ? '→ Directed' : '↔ Undirected'}
                </button>
                <button
                    onClick={toggleWeighted}
                    className={`px-3 py-1 text-xs rounded-md font-semibold border transition-colors ${isWeighted ? 'border-yellow-500 text-yellow-300 bg-yellow-950/50' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}
                >
                    {isWeighted ? '⚖ Weighted' : '— Unweighted'}
                </button>
                <button
                    onClick={handleReset}
                    className="ml-auto px-3 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold transition-colors"
                >
                    ↺ Reset
                </button>
            </div>

            {/* Context hint */}
            <div className="text-xs h-4">
                {!deleteMode && selectedNodeId ? (
                    <span className="text-yellow-400">
                        <strong>{selectedNodeId}</strong> selected — click another node to connect, or click again to deselect
                    </span>
                ) : !deleteMode ? (
                    <span className="text-slate-500">Click canvas to add node • Select a node then click another to add edge</span>
                ) : (
                    <span className="text-red-400">Delete mode: click a node or edge to remove it</span>
                )}
            </div>

            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                width="100%"
                height="320"
                className="bg-black/40 rounded-xl border border-slate-800 cursor-crosshair block"
                onClick={handleSVGClick}
            >
                <defs>
                    <marker
                        id={markerId}
                        markerWidth="8"
                        markerHeight="6"
                        refX="20"
                        refY="3"
                        orient="auto"
                    >
                        <polygon points="0 0, 8 3, 0 6" fill={color} opacity="0.8" />
                    </marker>
                </defs>

                {/* Edges */}
                {edges.map(edge => {
                    const src = getNode(edge.source);
                    const tgt = getNode(edge.target);
                    if (!src || !tgt) return null;
                    const mx = (src.x + tgt.x) / 2;
                    const my = (src.y + tgt.y) / 2;
                    const isSelEdge = selectedEdgeId === edge.id;
                    return (
                        <g key={edge.id} onClick={ev => handleEdgeClick(ev, edge.id)} style={{ cursor: 'pointer' }}>
                            {/* Wider invisible hit area */}
                            <line
                                x1={src.x} y1={src.y}
                                x2={tgt.x} y2={tgt.y}
                                stroke="transparent"
                                strokeWidth={14}
                            />
                            <line
                                x1={src.x} y1={src.y}
                                x2={tgt.x} y2={tgt.y}
                                stroke={isSelEdge ? '#fbbf24' : color}
                                strokeWidth={isSelEdge ? 2.5 : 1.5}
                                strokeOpacity={isSelEdge ? 1 : 0.5}
                                markerEnd={isDirected ? `url(#${markerId})` : undefined}
                            />
                            {/* Weight label */}
                            {isWeighted && (
                                <text
                                    x={mx} y={my - 6}
                                    fill="#fbbf24"
                                    fontSize="11"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {edge.weight}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                    const isSelNode = selectedNodeId === node.id;
                    return (
                        <g key={node.id} onClick={ev => handleNodeClick(ev, node.id)} style={{ cursor: 'pointer' }}>
                            {/* Selection glow ring */}
                            {isSelNode && (
                                <circle
                                    cx={node.x} cy={node.y} r={22}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={2}
                                    strokeOpacity={0.7}
                                    strokeDasharray="4 2"
                                />
                            )}
                            <circle
                                cx={node.x} cy={node.y} r={15}
                                fill={`${color}22`}
                                stroke={isSelNode ? color : `${color}99`}
                                strokeWidth={isSelNode ? 2.5 : 1.5}
                            />
                            <text
                                x={node.x} y={node.y}
                                fill={isSelNode ? color : 'white'}
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="central"
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                                {node.name}
                            </text>
                        </g>
                    );
                })}

                {/* Empty state hint */}
                {nodes.length === 0 && (
                    <text
                        x="50%" y="50%"
                        fill="#374151"
                        fontSize="14"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                        Click here to add nodes
                    </text>
                )}
            </svg>

            {/* Quick stats */}
            {nodes.length > 0 && (
                <div className="text-xs text-slate-400 flex gap-4 px-1">
                    <span>Nodes: <strong className="text-white">{nodes.length}</strong></span>
                    <span>Edges: <strong className="text-white">{edges.length}</strong></span>
                    <span>
                        {isDirected ? 'Directed' : 'Undirected'}
                        {isWeighted ? ', Weighted' : ''}
                    </span>
                </div>
            )}
        </div>
    );
}
