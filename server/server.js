/**
 * Graph Gladiators - Backend API Server
 *
 * Endpoints:
 *   POST /analyze  → analyze a single graph using Python/NetworkX
 *   POST /battle   → compare two graphs and determine the winner
 *
 * The server spawns a Python child process for each analysis request,
 * passing graph JSON via stdin and reading the results from stdout.
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PYTHON_SCRIPT = path.join(__dirname, '..', 'python', 'analyze_graph.py');

/**
 * Spawn the Python analysis script with the given graph data.
 * Graph JSON is passed via stdin; results are read from stdout.
 *
 * @param {object} graphData - { nodes, edges, directed, weighted }
 * @returns {Promise<object>} - computed metrics from NetworkX
 */
function analyzePython(graphData) {
    return new Promise((resolve, reject) => {
        // Try python3 first, fall back to python
        const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
        const proc = spawn(pythonBin, [PYTHON_SCRIPT]);

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', data => { stdout += data.toString(); });
        proc.stderr.on('data', data => { stderr += data.toString(); });

        proc.on('error', err => {
            // Python not found – try alternate binary
            const fallback = spawn('python', [PYTHON_SCRIPT]);
            let fb_out = '';
            fallback.stdout.on('data', d => { fb_out += d.toString(); });
            fallback.on('close', code => {
                if (code === 0) {
                    try { resolve(JSON.parse(fb_out)); }
                    catch { reject(new Error('Failed to parse Python output')); }
                } else {
                    reject(new Error(`Python not available: ${err.message}`));
                }
            });
            fallback.stdin.write(JSON.stringify(graphData));
            fallback.stdin.end();
        });

        proc.on('close', code => {
            if (code !== 0) {
                reject(new Error(stderr || `Python exited with code ${code}`));
                return;
            }
            try {
                resolve(JSON.parse(stdout));
            } catch {
                reject(new Error(`Failed to parse Python output: ${stdout}`));
            }
        });

        proc.stdin.write(JSON.stringify(graphData));
        proc.stdin.end();
    });
}

// ──────────────────────────────────────────────
// POST /analyze
// Body: { nodes, edges, directed?, weighted? }
// Returns computed graph metrics as JSON
// ──────────────────────────────────────────────
app.post('/analyze', async (req, res) => {
    try {
        const result = await analyzePython(req.body);
        res.json(result);
    } catch (err) {
        console.error('[/analyze] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ──────────────────────────────────────────────
// POST /battle
// Body: { graph1: GraphData, graph2: GraphData }
// Returns: { graph1Stats, graph2Stats, winner, explanation }
// ──────────────────────────────────────────────
app.post('/battle', async (req, res) => {
    const { graph1, graph2 } = req.body;

    if (!graph1 || !graph2) {
        return res.status(400).json({ error: 'Both graph1 and graph2 are required' });
    }

    try {
        // Analyze both graphs in parallel
        const [stats1, stats2] = await Promise.all([
            analyzePython(graph1),
            analyzePython(graph2),
        ]);

        const s1 = stats1.powerScore;
        const s2 = stats2.powerScore;

        let winner;
        let explanation;
        if (s1 > s2) {
            winner = 1;
            explanation = buildExplanation(1, stats1, stats2);
        } else if (s2 > s1) {
            winner = 2;
            explanation = buildExplanation(2, stats2, stats1);
        } else {
            winner = 0;
            explanation = `Perfect balance! Both graphs scored ${s1.toFixed(1)} — a draw!`;
        }

        res.json({ graph1Stats: stats1, graph2Stats: stats2, winner, explanation });
    } catch (err) {
        console.error('[/battle] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Build a human-readable explanation of why the winner won.
 */
function buildExplanation(winnerNum, winnerStats, loserStats) {
    const diff = (winnerStats.powerScore - loserStats.powerScore).toFixed(1);
    const reasons = [];

    if (winnerStats.nodeCount > loserStats.nodeCount) reasons.push('more nodes');
    if (winnerStats.edgeCount > loserStats.edgeCount) reasons.push('more edges');
    if (winnerStats.isConnected && !loserStats.isConnected) reasons.push('better connectivity');
    if (winnerStats.density > loserStats.density) reasons.push('higher density');
    if (winnerStats.avgCentrality > loserStats.avgCentrality) reasons.push('stronger centrality');
    if (winnerStats.hasCycles && !loserStats.hasCycles) reasons.push('cycle bonus');

    const reasonStr = reasons.length > 0
        ? ` (${reasons.join(', ')})`
        : '';
    return `Player ${winnerNum} wins by ${diff} points${reasonStr}!`;
}

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log(`\n🗡️  Graph Gladiators Server running on http://localhost:${PORT}`);
    console.log(`   POST /analyze  – analyze a single graph`);
    console.log(`   POST /battle   – compare two graphs\n`);
});
