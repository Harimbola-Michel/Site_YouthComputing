import { logger } from '@config/logger';
import { emailJob } from './email.job';
import { backupJob } from './backup.job';
import { cleanupJob } from './cleanup.job';
import { reportJob } from './report.job';
import { notificationJob } from './notification.job';
import { syncJob } from './sync.job';

interface ScheduledJob {
  name: string;
  cron: string;
  handler: () => Promise<void>;
  timer?: NodeJS.Timeout;
  running: boolean;
}

class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.registerJobs();
  }

  private registerJobs(): void {
    this.jobs.set('email', {
      name: 'email',
      cron: '*/5 * * * *', // Every 5 minutes
      handler: emailJob,
      running: false,
    });

    this.jobs.set('backup', {
      name: 'backup',
      cron: '0 2 * * *', // Daily at 2 AM
      handler: backupJob,
      running: false,
    });

    this.jobs.set('cleanup', {
      name: 'cleanup',
      cron: '0 3 * * *', // Daily at 3 AM
      handler: cleanupJob,
      running: false,
    });

    this.jobs.set('report', {
      name: 'report',
      cron: '0 8 * * *', // Daily at 8 AM
      handler: reportJob,
      running: false,
    });

    this.jobs.set('notification', {
      name: 'notification',
      cron: '*/30 * * * *', // Every 30 minutes
      handler: notificationJob,
      running: false,
    });

    this.jobs.set('sync', {
      name: 'sync',
      cron: '0 */4 * * *', // Every 4 hours
      handler: syncJob,
      running: false,
    });
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Job scheduler is already running');
      return;
    }

    logger.info('🚀 Starting job scheduler...');

    for (const [name, job] of this.jobs) {
      this.scheduleJob(job);
      logger.info(`📋 Scheduled job: ${name} (${job.cron})`);
    }

    this.isRunning = true;
    logger.info('✅ Job scheduler started successfully');
  }

  private scheduleJob(job: ScheduledJob): void {
    // Parse cron expression and calculate next execution time
    const interval = this.cronToInterval(job.cron);
    
    if (interval) {
      job.timer = setInterval(async () => {
        await this.executeJob(job);
      }, interval);
    } else {
      logger.warn(`⚠️ Could not parse cron for job: ${job.name}`);
    }
  }

  private async executeJob(job: ScheduledJob): Promise<void> {
    if (job.running) {
      logger.warn(`⏳ Job ${job.name} is already running, skipping...`);
      return;
    }

    job.running = true;
    try {
      logger.info(`⏰ Running job: ${job.name}`);
      const startTime = Date.now();
      await job.handler();
      const duration = Date.now() - startTime;
      logger.info(`✅ Job ${job.name} completed in ${duration}ms`);
    } catch (error) {
      logger.error(`❌ Job ${job.name} failed:`, error);
    } finally {
      job.running = false;
    }
  }

  private cronToInterval(cron: string): number | null {
    const parts = cron.split(' ');
    if (parts.length !== 5) return null;

    const [minute, hour, day, month, dayOfWeek] = parts;

    // Simple parser for common patterns
    if (minute === '*/5' && hour === '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      return 5 * 60 * 1000; // Every 5 minutes
    }
    if (minute === '0' && hour === '2' && day === '*' && month === '*' && dayOfWeek === '*') {
      return 24 * 60 * 60 * 1000; // Daily at 2 AM
    }
    if (minute === '0' && hour === '3' && day === '*' && month === '*' && dayOfWeek === '*') {
      return 24 * 60 * 60 * 1000; // Daily at 3 AM
    }
    if (minute === '0' && hour === '8' && day === '*' && month === '*' && dayOfWeek === '*') {
      return 24 * 60 * 60 * 1000; // Daily at 8 AM
    }
    if (minute === '*/30' && hour === '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      return 30 * 60 * 1000; // Every 30 minutes
    }
    if (minute === '0' && hour === '*/4' && day === '*' && month === '*' && dayOfWeek === '*') {
      return 4 * 60 * 60 * 1000; // Every 4 hours
    }

    // Default: return null for unsupported patterns
    return null;
  }

  stop(): void {
    if (!this.isRunning) {
      logger.warn('Job scheduler is not running');
      return;
    }

    logger.info('🛑 Stopping job scheduler...');

    for (const [name, job] of this.jobs) {
      if (job.timer) {
        clearInterval(job.timer);
        job.timer = undefined;
      }
      logger.info(`📋 Stopped job: ${name}`);
    }

    this.isRunning = false;
    logger.info('✅ Job scheduler stopped');
  }

  getJobStatus(name: string): { running: boolean; cron: string } | null {
    const job = this.jobs.get(name);
    if (!job) return null;
    return {
      running: job.running,
      cron: job.cron,
    };
  }

  getAllJobStatus(): Record<string, { running: boolean; cron: string }> {
    const status: Record<string, { running: boolean; cron: string }> = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        cron: job.cron,
      };
    }
    return status;
  }
}

export const jobScheduler = new JobScheduler();