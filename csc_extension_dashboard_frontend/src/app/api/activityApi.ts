// Fetch activity/sessions from Firebase Firestore
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface SessionDoc {
  id: string;
  sessionId: string;
  refId: string;
  timestamp: string;
  citizenName: string | null;
  citizenPhone: string | null;
  serviceType: string;
  extractedFields: Record<string, string | null>;
  confidenceScores: Record<string, number>;
  aiValidationResult: {
    overallRisk?: string;
    riskScore?: number;
    issues?: Array<{ field?: string; severity?: string }>;
    summaryHindi?: string;
    summaryEnglish?: string;
  } | null;
  operatorDecision: string;
  outcome?: string | null;
  operatorId?: string | null;
  source?: string;
}

function docToSession(doc: DocumentData, id: string): SessionDoc {
  const d = doc as Record<string, unknown>;
  const ts = d.timestamp;
  const timestamp =
    ts instanceof Timestamp
      ? ts.toDate().toISOString()
      : typeof ts === 'string'
      ? ts
      : new Date().toISOString();
  return {
    id,
    sessionId: (d.sessionId as string) || id,
    refId: (d.refId as string) || '',
    timestamp,
    citizenName: (d.citizenName as string | null) ?? null,
    citizenPhone: (d.citizenPhone as string | null) ?? null,
    serviceType: (d.serviceType as string) || 'default',
    extractedFields: (d.extractedFields as Record<string, string | null>) || {},
    confidenceScores: (d.confidenceScores as Record<string, number>) || {},
    aiValidationResult: (d.aiValidationResult as SessionDoc['aiValidationResult']) ?? null,
    operatorDecision: (d.operatorDecision as string) || 'SUBMITTED',
    outcome: (d.outcome as string | null) ?? null,
    operatorId: (d.operatorId as string | null) ?? null,
    source: (d.source as string) ?? 'extension',
  };
}

export async function getRecentSessions(limitCount = 100): Promise<SessionDoc[]> {
  const q = query(
    collection(db, 'sessions'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToSession(doc.data(), doc.id));
}

export async function getSessionsByOperator(operatorId: string, limitCount = 50): Promise<SessionDoc[]> {
  const all = await getRecentSessions(500);
  return all.filter((s) => s.operatorId === operatorId).slice(0, limitCount);
}

export async function getSessionsByDateRange(
  startDate: Date,
  endDate: Date,
  limitCount = 500
): Promise<SessionDoc[]> {
  const all = await getRecentSessions(500);
  return all
    .filter((s) => {
      const d = new Date(s.timestamp);
      return d >= startDate && d <= endDate;
    })
    .slice(0, limitCount);
}

export async function getAggregatedStats() {
  const sessions = await getRecentSessions(500);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const todaySessions = sessions.filter((s) => new Date(s.timestamp) >= todayStart);
  const weekSessions = sessions.filter((s) => new Date(s.timestamp) >= weekStart);

  const byService: Record<string, number> = {};
  let totalWarnings = 0;
  let highRiskCount = 0;
  let approvedCount = 0;
  const operatorIds = new Set<string>();

  sessions.forEach((s) => {
    byService[s.serviceType] = (byService[s.serviceType] || 0) + 1;
    const validation = s.aiValidationResult;
    if (validation?.issues) totalWarnings += validation.issues.length;
    if (validation?.overallRisk === 'HIGH') highRiskCount++;
    else if (validation?.overallRisk === 'LOW' || !validation?.overallRisk) approvedCount++;
    if (s.operatorId) operatorIds.add(s.operatorId);
  });

  const totalSessions = sessions.length;
  const acceptanceRate =
    totalSessions > 0 ? Math.round((approvedCount / totalSessions) * 100) : 0;

  return {
    totalSessions,
    todayCount: todaySessions.length,
    weekCount: weekSessions.length,
    byService,
    totalWarnings,
    highRiskCount,
    acceptanceRate,
    activeOperatorCount: operatorIds.size || 1,
    sessionsByDate: groupSessionsByDate(weekSessions),
  };
}

function groupSessionsByDate(sessions: SessionDoc[]): { date: string; count: number }[] {
  const byDate: Record<string, number> = {};
  sessions.forEach((s) => {
    const d = s.timestamp.slice(0, 10);
    byDate[d] = (byDate[d] || 0) + 1;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
