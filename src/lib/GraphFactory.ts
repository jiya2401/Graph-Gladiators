import type { GraphData } from "./GraphEngine";

export const GraphFactory = {
    createTree(size: number, directed = false): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `N${i}` }));
        const edges = [];
        for (let i = 1; i < size; i++) {
            // Connect to a random existing node to form a tree
            const target = Math.floor(Math.random() * i);
            edges.push({ source: nodes[target].id, target: nodes[i].id, directed, weight: 1 });
        }
        return { nodes, edges, directed, weighted: false };
    },

    createCyclic(size: number, directed = true): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `N${i}` }));
        const edges = [];
        for (let i = 0; i < size; i++) {
            edges.push({ source: nodes[i].id, target: nodes[(i + 1) % size].id, directed, weight: 1 });
        }
        return { nodes, edges, directed, weighted: false };
    },

    createDense(size: number, directed = false): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `N${i}` }));
        const edges = [];
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (Math.random() > 0.3) {
                    edges.push({ source: nodes[i].id, target: nodes[j].id, directed, weight: Math.ceil(Math.random() * 10) });
                }
            }
        }
        return { nodes, edges, directed, weighted: true };
    },

    createStar(size: number, directed = false): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `N${i}` }));
        const edges = [];
        for (let i = 1; i < size; i++) {
            edges.push({ source: nodes[0].id, target: nodes[i].id, directed, weight: 1 });
        }
        return { nodes, edges, directed, weighted: false };
    },

    // Generate a random Erdős–Rényi graph with given edge probability
    createRandom(size: number, edgeProbability = 0.4, directed = false): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `N${i}` }));
        const edges = [];
        for (let i = 0; i < size; i++) {
            for (let j = directed ? 0 : i + 1; j < size; j++) {
                if (i !== j && Math.random() < edgeProbability) {
                    edges.push({ source: nodes[i].id, target: nodes[j].id, directed, weight: Math.ceil(Math.random() * 10) });
                }
            }
        }
        return { nodes, edges, directed, weighted: true };
    }
};

