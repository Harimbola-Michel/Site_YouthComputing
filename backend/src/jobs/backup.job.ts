import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '@config/logger';
import { env } from '@config/env';
import { format } from 'date-fns';

const execAsync = promisify(exec);

export const backupJob = async (): Promise<void> => {
  try {
    const backupPath = env.BACKUP_PATH || './backups';
    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(backupPath, filename);

    // Ensure backup directory exists
    await fs.mkdir(backupPath, { recursive: true });

    // Get database URL from env
    const dbUrl = env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set');
    }

    // Extract connection details from URL
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = match;

    // Set PGPASSWORD for pg_dump
    process.env.PGPASSWORD = password;

    // Perform backup using pg_dump
    const { stdout, stderr } = await execAsync(
      `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F c -f ${filepath}`
    );

    if (stderr) {
      logger.warn(`Backup warnings: ${stderr}`);
    }

    // Get file size
    const stats = await fs.stat(filepath);

    // Write backup info
    await fs.writeFile(
      path.join(backupPath, 'backup-info.json'),
      JSON.stringify({
        filename,
        timestamp: new Date().toISOString(),
        size: stats.size,
        type: 'full',
        database,
        host,
      }, null, 2)
    );

    logger.info(`✅ Database backup completed: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Cleanup old backups (keep last 30 days)
    await cleanupOldBackups(backupPath);

  } catch (error) {
    logger.error('❌ Backup job failed:', error);
    throw error;
  }
};

const cleanupOldBackups = async (backupPath: string): Promise<void> => {
  try {
    const files = await fs.readdir(backupPath);
    const backupFiles = files.filter(f => f.endsWith('.sql'));
    const retentionDays = parseInt(env.BACKUP_RETENTION_DAYS || '30');
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    let removed = 0;
    for (const file of backupFiles) {
      const filepath = path.join(backupPath, file);
      const stats = await fs.stat(filepath);
      if (stats.mtimeMs < cutoffDate) {
        await fs.unlink(filepath);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(`🗑️ Removed ${removed} old backup(s)`);
    }
  } catch (error) {
    logger.error('Failed to cleanup old backups:', error);
  }
};