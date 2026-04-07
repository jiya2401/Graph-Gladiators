export type NodeType = string;

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
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface GraphProperties {
    nodeCount: number;
    edgeCount: number;
    density: number;
    isConnected: boolean;
    hasCycles: boolean;
    isTree: boolean;
    isComplete: boolean;
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

    analyze(): GraphProperties {
        const V = this.graph.nodes.length;
        const E = this.graph.edges.length;
        const isConnected = this.checkConnectivity();
        const hasCycles = this.detectCycle();
        const density = this.getDensity();

        // Properties
        const isTree = isConnected && V - 1 === E && !hasCycles;
        const isComplete = density === 1;

        let powerScore = V * 10 + E * 5;
        let abilities: string[] = [];

        if (isConnected) {
            powerScore += 20;
        }
        if (hasCycles) {
            powerScore += 15; // Strategic attack boost
            abilities.push('Attack Boost (Cyclic)');
        }
        if (isTree) {
            powerScore += 25; // Stability
            abilities.push('High Stability (Tree)');
        }
        if (density > 0.8) {
            powerScore += 30; // High Energy
            abilities.push('High Energy (Dense)');
        }

        // More edges / more damage power

        return {
            nodeCount: V,
            edgeCount: E,
            density,
            isConnected,
            hasCycles,
            isTree,
            isComplete,
            powerScore,
            abilities
        };
    }
}
