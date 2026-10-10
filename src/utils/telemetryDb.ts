export interface TelemetryPacket {
  id?: number;
  sessionId: string;
  timestamp: number; // elapsed seconds or unix ms
  ch1_fz: number; // Frontal uV
  ch2_cz: number; // Motor uV
  ch3_pz: number; // Parietal uV
  ch4_oz: number; // Occipital uV
  state: 'Focused' | 'Relaxed' | 'Fatigued';
  focusScore: number; // 0 - 100 %
  psdPeakFreq: number; // Hz
}

export interface TelemetrySession {
  id: string; // e.g. KX-SESS-20261010-001
  title: string;
  subjectId: string;
  createdAt: string;
  durationSec: number;
  totalPackets: number;
  sampleRate: number; // e.g. 250 Hz
  avgFocusScore: number;
  dominantState: 'Focused' | 'Relaxed' | 'Fatigued';
  notes?: string;
  sizeBytes?: number;
}

const DB_NAME = 'KateriyaX_TelemetryDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export async function openTelemetryDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Sessions Store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('createdAt', 'createdAt', { unique: false });
        sessionStore.createIndex('subjectId', 'subjectId', { unique: false });
      }

      // Packets Store
      if (!db.objectStoreNames.contains('packets')) {
        const packetStore = db.createObjectStore('packets', { keyPath: 'id', autoIncrement: true });
        packetStore.createIndex('sessionId', 'sessionId', { unique: false });
        packetStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function saveSessionRecord(session: TelemetrySession): Promise<void> {
  const db = await openTelemetryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const req = store.put(session);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function savePacketsBatch(packets: TelemetryPacket[]): Promise<void> {
  if (packets.length === 0) return;
  const db = await openTelemetryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packets', 'readwrite');
    const store = tx.objectStore('packets');

    for (const p of packets) {
      store.add(p);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllSessions(): Promise<TelemetrySession[]> {
  const db = await openTelemetryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const req = store.getAll();
    req.onsuccess = () => {
      // Sort newest first
      const results: TelemetrySession[] = req.result || [];
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSessionPackets(sessionId: string): Promise<TelemetryPacket[]> {
  const db = await openTelemetryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('packets', 'readonly');
    const store = tx.objectStore('packets');
    const index = store.index('sessionId');
    const req = index.getAll(sessionId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openTelemetryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sessions', 'packets'], 'readwrite');

    // 1. Delete from sessions
    const sessionStore = tx.objectStore('sessions');
    sessionStore.delete(sessionId);

    // 2. Delete packets with this sessionId
    const packetStore = tx.objectStore('packets');
    const index = packetStore.index('sessionId');
    const req = index.openKeyCursor(IDBKeyRange.only(sessionId));

    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        packetStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportSessionToCSV(sessionId: string): Promise<void> {
  const packets = await getSessionPackets(sessionId);
  if (packets.length === 0) {
    throw new Error('No packets found for this session');
  }

  const headers = ['Timestamp_Sec', 'Channel_Fz_uV', 'Channel_Cz_uV', 'Channel_Pz_uV', 'Channel_Oz_uV', 'Focus_Factor_Pct', 'Cognitive_State', 'PSD_Peak_Freq_Hz'];
  const rows = packets.map((p) => [
    p.timestamp.toFixed(4),
    p.ch1_fz.toFixed(3),
    p.ch2_cz.toFixed(3),
    p.ch3_pz.toFixed(3),
    p.ch4_oz.toFixed(3),
    p.focusScore.toFixed(1),
    p.state,
    p.psdPeakFreq.toFixed(1),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kateriya_x_telemetry_${sessionId}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportSessionToJSON(sessionId: string, sessionMeta?: TelemetrySession): Promise<void> {
  const packets = await getSessionPackets(sessionId);
  const payload = {
    metadata: sessionMeta || { sessionId },
    system: 'Project Kateriya-X Neural Resonance Core',
    exportDate: new Date().toISOString(),
    totalPackets: packets.length,
    packets,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kateriya_x_telemetry_${sessionId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function getBrowserStorageStats(): Promise<{ usageMB: number; quotaMB: number; percent: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usageMB = Math.round(((estimate.usage || 0) / (1024 * 1024)) * 100) / 100;
    const quotaMB = Math.round(((estimate.quota || 0) / (1024 * 1024)) * 100) / 100;
    const percent = quotaMB > 0 ? Math.round((usageMB / quotaMB) * 1000) / 10 : 0;
    return { usageMB, quotaMB, percent };
  }
  return { usageMB: 0, quotaMB: 1000, percent: 0 };
}
