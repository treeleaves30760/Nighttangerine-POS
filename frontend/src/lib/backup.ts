const DEFAULT_BASES = ['http://localhost:3001', 'http://localhost:3000'];
const ENV_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_CANDIDATES = ENV_BASE ? [ENV_BASE, ...DEFAULT_BASES.filter((b) => b !== ENV_BASE)] : DEFAULT_BASES;

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let lastErr: unknown = null;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
      if (!res.ok) {
        lastErr = new Error(`Backup API error: ${res.status}`);
        break;
      }
      return (res.status === 204 ? null : await res.json()) as T;
    } catch (err) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Backup API error');
}

export interface BackupInfo {
  database: {
    orders: number;
    products: number;
    orderItems: number;
  };
  lastBackup: string | null;
}

export interface BackupData {
  version: string;
  timestamp: string;
  orders: any[];
  products: any[];
}

export interface ImportResult {
  success: boolean;
  imported: {
    orders: number;
    products: number;
  };
  message: string;
}

export const backupApi = {
  // Get backup system information
  async getInfo(): Promise<BackupInfo> {
    return await fetchApi<BackupInfo>('/api/backup/info');
  },

  // Export database backup
  async exportBackup(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_CANDIDATES[0]}/api/backup/export`);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from response headers or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'nighttangerine-pos-backup.json';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  // Import database backup
  async importBackup(backupData: BackupData): Promise<ImportResult> {
    return await fetchApi<ImportResult>('/api/backup/import', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  },

  // Helper function to read backup file
  async readBackupFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text) as BackupData;

          // Basic validation
          if (!data.version || !data.orders || !data.products) {
            throw new Error('Invalid backup file format');
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse backup file: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};