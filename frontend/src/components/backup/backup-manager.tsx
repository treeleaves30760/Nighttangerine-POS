"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, Database, AlertCircle, CheckCircle, Info } from "lucide-react";
import { backupApi, type BackupInfo, type ImportResult } from "@/lib/backup";

export function BackupManager() {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load backup information on component mount
  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      setLoading(true);
      const info = await backupApi.getInfo();
      setBackupInfo(info);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load backup information' });
      console.error('Failed to load backup info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);
      await backupApi.exportBackup();
      setMessage({ type: 'success', text: 'Database backup exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export backup: ' + (error as Error).message });
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setMessage(null);

      // Read and parse the backup file
      const backupData = await backupApi.readBackupFile(file);

      // Show confirmation dialog
      const confirmMessage = `Import backup from ${new Date(backupData.timestamp).toLocaleString()}?\n\nThis will:\n- Import ${backupData.orders.length} orders\n- Import ${backupData.products.length} products\n\nExisting data with same IDs will be updated.`;

      if (!confirm(confirmMessage)) {
        setImporting(false);
        return;
      }

      // Import the backup
      const result: ImportResult = await backupApi.importBackup(backupData);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Backup imported successfully! ${result.imported.orders} orders and ${result.imported.products} products imported.`
        });
        // Refresh backup info
        await loadBackupInfo();
      } else {
        setMessage({ type: 'error', text: 'Import failed: ' + result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed: ' + (error as Error).message });
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Database Backup Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Database Statistics */}
          {backupInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{backupInfo.database.orders}</div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{backupInfo.database.products}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{backupInfo.database.orderItems}</div>
                <div className="text-sm text-muted-foreground">Order Items</div>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <Alert className={message.type === 'error' ? 'border-destructive' : message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
              {message.type === 'error' && <AlertCircle className="size-4" />}
              {message.type === 'success' && <CheckCircle className="size-4" />}
              {message.type === 'info' && <Info className="size-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Export Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Database Backup</Label>
            <p className="text-sm text-muted-foreground">
              Download a complete backup of your database including all orders, products, and order items.
            </p>
            <Button
              onClick={handleExport}
              disabled={exporting || loading}
              className="w-full md:w-auto"
            >
              <Download className="size-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Backup'}
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Import Database Backup</Label>
            <p className="text-sm text-muted-foreground">
              Restore your database from a backup file. This will update existing records and create new ones as needed.
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing || loading}
                className="flex-1"
              />
              <Button
                variant="outline"
                disabled={importing || loading}
                onClick={() => document.querySelector('input[type="file"]')?.click()}
              >
                <Upload className="size-4 mr-2" />
                {importing ? 'Importing...' : 'Select File'}
              </Button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Info className="size-4" />
              Important Notes
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Backup files contain complete database snapshots</li>
              <li>• Import will update existing records with matching IDs</li>
              <li>• Always test imports on a backup of your data first</li>
              <li>• Export backups regularly to prevent data loss</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}