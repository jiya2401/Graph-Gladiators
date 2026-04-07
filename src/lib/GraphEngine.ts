export interface GraphNode {
    id: string;
    name?: string;
    val?: number;
    color?: string;
}

export interface GraphEdge {
    source: string;
    target: string;
    directed: boolean;
    weight?: number;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    directed?: boolean;
    weighted?: boolean;
}

export interface GraphProperties {
    nodeCount: number;
    edgeCount: number;
    density: number;
    isConnected: boolean;
    hasCycles: boolean;
    isTree: boolean;
    isComplete: boolean;
    avgCentrality: number;
    avgShortestPath: number;
    powerScore: number;
    abilities: string[];
}

export class GraphEngine {
    graph: GraphData;

    constructor(graph: GraphData) {
        this.graph = graph;
    }

    // Calculate density: 2E / (V * (V - 1)) for undirected
    getDensity(): number {
        const V = this.graph.nodes.length;
        const E = this.graph.edges.length;
        if (V <= 1) return 0;
        return (2 * E) / (V * (V - 1));
    }

    // Build Adjacency List for undirected
    getAdjacencyList(): Map<string, string[]> {
        const adj = new Map<string, string[]>();
        this.graph.nodes.forEach(n => adj.set(n.id, []));

        this.graph.edges.forEach(e => {
            adj.get(e.source)?.push(e.target);
            if (!e.directed) {
                adj.get(e.target)?.push(e.source);
            }
        });
        return adj;
    }

    // Check connectivity using BFS or DFS
    checkConnectivity(): boolean {
        if (this.graph.nodes.length === 0) return false;
        const adj = this.getAdjacencyList();
        const visited = new Set<string>();

        const startNode = this.graph.nodes[0].id;
        const queue = [startNode];
        visited.add(startNode);

        while (queue.length > 0) {
            const curr = queue.shift()!;
            for (const neighbor of adj.get(curr) || []) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        return visited.size === this.graph.nodes.length;
    }

    // Detect cycles using DFS for undirected graphs
    detectCycle(): boolean {
        const adj = this.getAdjacencyList();
        const visited = new Set<string>();

        const dfs = (curr: string, parent: string | null): boolean => {
            visited.add(curr);
            for (const neighbor of adj.get(curr) || []) {
                if (!visited.has(neighbor)) {
                    if (dfs(neighbor, curr)) return true;
                } else if (neighbor !== parent) {
                    return true; // Cycle detected
                }
            }
            return false;
        };

        for (const node of this.graph.nodes) {
            if (!visited.has(node.id)) {
                if (dfs(node.id, null)) return true;
            }
        }
        return false;
    }

    // Compute degree centrality: degree(v) / (n - 1) for undirected
    getDegreeCentrality(): Map<string, number> {
        const V = this.graph.nodes.length;
        if (V <= 1) return new Map();
        const adj = this.getAdjacencyList();
        const centrality = new Map<string, number>();
        this.graph.nodes.forEach(n => {
            centrality.set(n.id, (adj.get(n.id)?.length ?? 0) / (V - 1));
        });
        return centrality;
    }

    // Average degree centrality across all nodes
    getAvgCentrality(): number {
        const centrality = this.getDegreeCentrality();
        if (centrality.size === 0) return 0;
        let total = 0;
        centrality.forEach(c => (total += c));
        return total / centrality.size;
    }

    // BFS-based shortest path length between two nodes
    bfsDistance(from: string, to: string): number {
        const adj = this.getAdjacencyList();
        const dist = new Map<string, number>();
        dist.set(from, 0);
        const queue = [from];
        while (queue.length) {
            const curr = queue.shift()!;
            for (const nb of adj.get(curr) ?? []) {
                if (!dist.has(nb)) {
                    dist.set(nb, dist.get(curr)! + 1);
                    queue.push(nb);
                }
            }
        }
        return dist.get(to) ?? Infinity;
    }

    // Average shortest path length (for connected graphs)
    getAvgShortestPath(): number {
        const nodes = this.graph.nodes;
        if (nodes.length <= 1) return 0;
        if (!this.checkConnectivity()) return 0;
        let total = 0;
        let count = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const d = this.bfsDistance(nodes[i].id, nodes[j].id);
                if (d !== Infinity) {
                    total += d;
                    count++;
                }
            }
        }
        return count > 0 ? total / count : 0;
    }

    analyze(): GraphProperties {
        const V = this.graph.nodes.length;
        const E = this.graph.edges.length;
        const isConnected = this.checkConnectivity();
        const hasCycles = this.detectCycle();
        const density = this.getDensity();
        const avgCentrality = this.getAvgCentrality();
        const avgShortestPath = isConnected ? this.getAvgShortestPath() : 0;

        const isTree = isConnected && V - 1 === E && !hasCycles;
        const isComplete = density === 1;

        // Power score formula (matches problem spec weights):
        // Nodes × 1 + Edges × 2 + Connectivity × 30 + Density × 200 + Centrality × 300 + Cycles × 20
        let powerScore = V * 1 + E * 2 + (isConnected ? 30 : 0) + density * 200 + avgCentrality * 300 + (hasCycles ? 20 : 0);
        const abilities: string[] = [];

        if (isConnected) abilities.push('Connected Graph');
        if (hasCycles) abilities.push('Attack Boost (Cyclic)');
        if (isTree) abilities.push('High Stability (Tree)');
        if (density > 0.8) {
            powerScore += 30;
            abilities.push('High Energy (Dense)');
        }
        if (isComplete) abilities.push('Complete Graph');

        return {
            nodeCount: V,
            edgeCount: E,
            density,
            isConnected,
            hasCycles,
            isTree,
            isComplete,
            avgCentrality,
            avgShortestPath,
            powerScore,
            abilities
        };
    }
}
