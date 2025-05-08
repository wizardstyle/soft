import { differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { Repair } from '../types';
import useBackupStore from '../store/backupStore';

export class BackupService {
  private static getBackupFileName(date: Date): string {
    return `repair-system-backup-${date.toISOString().split('T')[0]}.json`;
  }

  private static shouldBackup(lastBackup: string | null, frequency: 'daily' | 'weekly' | 'monthly'): boolean {
    if (!lastBackup) return true;

    const now = new Date();
    const lastBackupDate = new Date(lastBackup);

    switch (frequency) {
      case 'daily':
        return differenceInDays(now, lastBackupDate) >= 1;
      case 'weekly':
        return differenceInWeeks(now, lastBackupDate) >= 1;
      case 'monthly':
        return differenceInMonths(now, lastBackupDate) >= 1;
      default:
        return false;
    }
  }

  private static async cleanOldBackups(maxBackups: number) {
    try {
      const backups = await this.listBackups();
      if (backups.length > maxBackups) {
        const toDelete = backups.slice(maxBackups);
        for (const backup of toDelete) {
          await this.deleteBackup(backup);
        }
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  private static async listBackups(): Promise<string[]> {
    const backups: string[] = [];
    try {
      const storedBackups = localStorage.getItem('repair-system-backups');
      if (storedBackups) {
        backups.push(...JSON.parse(storedBackups));
      }
    } catch (error) {
      console.error('Error listing backups:', error);
    }
    return backups.sort().reverse();
  }

  private static async deleteBackup(filename: string) {
    try {
      const backups = await this.listBackups();
      const updatedBackups = backups.filter(b => b !== filename);
      localStorage.setItem('repair-system-backups', JSON.stringify(updatedBackups));
      localStorage.removeItem(`backup-${filename}`);
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  }

  public static async performBackup(repairs: Repair[]) {
    const { enabled, frequency, lastBackup, maxBackups } = useBackupStore.getState();

    if (!enabled || !this.shouldBackup(lastBackup, frequency)) {
      return;
    }

    try {
      const now = new Date();
      const filename = this.getBackupFileName(now);
      const backupData = JSON.stringify(repairs);

      // Store the backup
      localStorage.setItem(`backup-${filename}`, backupData);

      // Update backup list
      const backups = await this.listBackups();
      backups.unshift(filename);
      localStorage.setItem('repair-system-backups', JSON.stringify(backups));

      // Update last backup date
      useBackupStore.getState().setLastBackup(now.toISOString());

      // Clean old backups
      await this.cleanOldBackups(maxBackups);

      console.log('Backup completed successfully:', filename);
    } catch (error) {
      console.error('Error performing backup:', error);
    }
  }

  public static async restoreBackup(filename: string): Promise<Repair[] | null> {
    try {
      const backupData = localStorage.getItem(`backup-${filename}`);
      if (backupData) {
        return JSON.parse(backupData);
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
    }
    return null;
  }
}