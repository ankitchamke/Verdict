import { type MockVerdict } from './mock-analysis';

export type HistoryEntry = {
  id: string;
  idea: string;
  score: number;
  createdAt: string;
  verdict: MockVerdict;
  roastMode?: boolean;
};

export function getHistoryStorageKey(userId: string): string {
  return `verdict-history-${userId}`;
}

export function loadUserHistory(userId: string): HistoryEntry[] {
  if (!userId || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getHistoryStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Failed to load user history from localStorage:', err);
    return [];
  }
}

export function saveUserHistory(userId: string, entries: HistoryEntry[]): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getHistoryStorageKey(userId), JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save user history to localStorage:', err);
  }
}

export function addHistoryEntry(
  userId: string,
  idea: string,
  verdict: MockVerdict,
  roastMode?: boolean,
): HistoryEntry[] {
  if (!userId) return [];
  const existing = loadUserHistory(userId);
  const newEntry: HistoryEntry = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    idea,
    score: verdict.score,
    createdAt: new Date().toISOString(),
    verdict,
    roastMode: Boolean(roastMode),
  };
  const updated = [newEntry, ...existing];
  saveUserHistory(userId, updated);
  return updated;
}

export function deleteHistoryEntry(userId: string, id: string): HistoryEntry[] {
  if (!userId) return [];
  const existing = loadUserHistory(userId);
  const updated = existing.filter((item) => item.id !== id);
  saveUserHistory(userId, updated);
  return updated;
}

export function clearUserHistory(userId: string): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(getHistoryStorageKey(userId));
  } catch (err) {
    console.error('Failed to clear user history from localStorage:', err);
  }
}
