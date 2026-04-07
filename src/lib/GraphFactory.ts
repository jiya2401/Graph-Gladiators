import type { GraphData } from "./GraphEngine";

export const GraphFactory = {
    createTree(size: number): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `Tree Node ${i}` }));
        const edges = [];
        for (let i = 1; i < size; i++) {
            // connect to a random existing node to form a tree
            const target = Math.floor(Math.random() * i);
            edges.push({ source: nodes[target].id, target: nodes[i].id, directed: false });
        }
        return { nodes, edges };
    },

    createCyclic(size: number): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}`, name: `Ring Node ${i}` }));
        const edges = [];
        for (let i = 0; i < size; i++) {
            edges.push({ source: nodes[i].id, target: nodes[(i + 1) % size].id, directed: true });
        }
        return { nodes, edges };
    },

    createDense(size: number): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}` }));
        const edges = [];
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (Math.random() > 0.3) {
                    edges.push({ source: nodes[i].id, target: nodes[j].id, directed: false });
                }
            }
        }
        return { nodes, edges };
    },

    createStar(size: number): GraphData {
        const nodes = Array.from({ length: size }).map((_, i) => ({ id: `n${i}` }));
        const edges = [];
        for (let i = 1; i < size; i++) {
            edges.push({ source: nodes[0].id, target: nodes[i].id, directed: false });
        }
        return { nodes, edges };
    }
}
