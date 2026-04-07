#!/usr/bin/env python3
"""
Graph Gladiators – NetworkX Analysis Script
============================================
Reads a graph JSON from stdin, computes graph-theoretic metrics using
NetworkX, and prints a JSON result to stdout.

Input JSON format:
  {
    "nodes": [{"id": "n0"}, {"id": "n1"}, ...],
    "edges": [{"source": "n0", "target": "n1", "weight": 1}, ...],
    "directed": false,
    "weighted": false
  }

Output JSON format:
  {
    "nodeCount":       int,
    "edgeCount":       int,
    "isConnected":     bool,
    "density":         float,
    "avgCentrality":   float,
    "centrality":      { nodeId: float, ... },
    "hasCycles":       bool,
    "shortestPathAvg": float,
    "powerScore":      float,
    "directed":        bool,
    "weighted":        bool
  }
"""

import sys
import json
import networkx as nx


def analyze(data: dict) -> dict:
    nodes: list = data.get("nodes", [])
    edges: list = data.get("edges", [])
    directed: bool = bool(data.get("directed", False))
    weighted: bool = bool(data.get("weighted", False))

    # ── Build NetworkX graph ──────────────────────────────────────────────
    G = nx.DiGraph() if directed else nx.Graph()

    for node in nodes:
        G.add_node(str(node["id"]))

    for edge in edges:
        src = str(edge["source"])
        tgt = str(edge["target"])
        w = float(edge.get("weight", 1))
        G.add_edge(src, tgt, weight=w)

    V = G.number_of_nodes()
    E = G.number_of_edges()

    # ── Connectivity ──────────────────────────────────────────────────────
    if V == 0:
        is_connected = False
    elif directed:
        is_connected = nx.is_weakly_connected(G)
    else:
        is_connected = nx.is_connected(G)

    # ── Density ───────────────────────────────────────────────────────────
    density = nx.density(G)

    # ── Degree Centrality ─────────────────────────────────────────────────
    centrality: dict = nx.degree_centrality(G)
    avg_centrality = (
        sum(centrality.values()) / len(centrality) if centrality else 0.0
    )

    # ── Cycle Detection ───────────────────────────────────────────────────
    try:
        nx.find_cycle(G)
        has_cycles = True
    except nx.NetworkXNoCycle:
        has_cycles = False
    except nx.exception.NetworkXError:
        has_cycles = False

    # ── Average Shortest Path (Dijkstra) ──────────────────────────────────
    shortest_path_avg = 0.0
    if V > 1 and is_connected:
        try:
            weight_attr = "weight" if weighted else None
            if directed:
                lengths = dict(nx.all_pairs_dijkstra_path_length(G, weight=weight_attr))
            else:
                lengths = dict(nx.all_pairs_dijkstra_path_length(G, weight=weight_attr))

            total = 0.0
            count = 0
            for src_node, targets in lengths.items():
                for tgt_node, length in targets.items():
                    if src_node != tgt_node:
                        total += length
                        count += 1
            shortest_path_avg = total / count if count > 0 else 0.0
        except Exception:
            shortest_path_avg = 0.0

    # ── Power Score ───────────────────────────────────────────────────────
    # Formula weights (per problem specification):
    #   Nodes ×1  |  Edges ×2  |  Connectivity ×3(×10)
    #   Density ×2(×100)  |  Centrality ×3(×100)  |  Cycles ×2(×10)
    power_score = (
        V * 1
        + E * 2
        + (30 if is_connected else 0)     # connectivity  weight 3  (×10)
        + density * 200                    # density       weight 2  (×100)
        + avg_centrality * 300             # centrality    weight 3  (×100)
        + (20 if has_cycles else 0)        # cycles        weight 2  (×10)
    )

    return {
        "nodeCount": V,
        "edgeCount": E,
        "isConnected": is_connected,
        "density": density,
        "avgCentrality": avg_centrality,
        "centrality": centrality,
        "hasCycles": has_cycles,
        "shortestPathAvg": shortest_path_avg,
        "powerScore": power_score,
        "directed": directed,
        "weighted": weighted,
    }


if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"error": "No input received"}))
        sys.exit(1)

    try:
        input_data = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {e}"}))
        sys.exit(1)

    result = analyze(input_data)
    print(json.dumps(result))
