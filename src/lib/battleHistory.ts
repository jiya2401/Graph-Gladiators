/**
 * Battle history utilities
 * Handles reading and writing battle records to localStorage.
 */

export interface BattleRecord {
    id: string;
    timestamp: string;
    p1Nodes: number;
    p1Edges: number;
    p1Score: number;
    p2Nodes: number;
    p2Edges: number;
    p2Score: number;
    winner: 0 | 1 | 2;
    explanation: string;
}

const STORAGE_KEY = 'graph-gladiators-history';
const MAX_RECORDS = 20;

export function loadHistory(): BattleRecord[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as BattleRecord[]) : [];
    } catch {
        return [];
    }
}

export function saveRecord(record: BattleRecord): void {
    const history = loadHistory();
    const updated = [record, ...history].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}
