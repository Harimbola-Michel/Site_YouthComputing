import { logger } from '@config/logger';
import { StatsService } from '@services/stats.service';
import { ExportService } from '@services/export.service';
import { mailer } from '@config/mailer';
import { env } from '@config/env';
import { format } from 'date-fns';

const statsService = new StatsService();
const exportService = new ExportService();

export const reportJob = async (): Promise<void> => {
  try {
    logger.info('📊 Generating daily report...');

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get stats
    const globalStats = await statsService.getGlobalStats();
    const dailyStats = await statsService.getDailyStats(yesterday);
    const monthlyStats = await statsService.getMonthlyStats();

    // Generate report data
    const reportData = {
      date: format(now, 'yyyy-MM-dd HH:mm:ss'),
      period: 'daily',
      global: globalStats,
      daily: dailyStats,
      monthly: monthlyStats,
    };

    // Export to JSON
    const jsonReport = JSON.stringify(reportData, null, 2);

    // Export to CSV for registrations
    const registrationsCsv = await exportService.exportRegistrations('csv', {
      dateFrom: format(yesterday, 'yyyy-MM-dd'),
      dateTo: format(now, 'yyyy-MM-dd'),
    });

    // Send report to admin email
    await mailer.sendTemplatedEmail(
      env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
      'daily-report',
      {
        content: `
          <h2>Rapport quotidien - ${format(now, 'dd/MM/yyyy')}</h2>
          
          <h3>Résumé</h3>
          <ul>
            <li><strong>Nouveaux utilisateurs:</strong> ${dailyStats.newUsers}</li>
            <li><strong>Nouvelles inscriptions:</strong> ${dailyStats.newRegistrations}</li>
            <li><strong>Nouveaux membres Y2C:</strong> ${dailyStats.newY2CMembers}</li>
            <li><strong>Paiements:</strong> ${dailyStats.newPayments}</li>
            <li><strong>Revenus:</strong> ${dailyStats.revenue} MGA</li>
          </ul>
          
          <h3>Statistiques globales</h3>
          <ul>
            <li><strong>Total utilisateurs:</strong> ${globalStats.users?.total || 0}</li>
            <li><strong>Total formations:</strong> ${globalStats.formations?.total || 0}</li>
            <li><strong>Total membres Y2C:</strong> ${globalStats.y2c?.totalMembers || 0}</li>
            <li><strong>Total projets:</strong> ${globalStats.projects?.total || 0}</li>
          </ul>
          
          <p>Le rapport complet est disponible en pièce jointe.</p>
        `,
        attachments: [
          {
            filename: `report-${format(now, 'yyyy-MM-dd')}.json`,
            content: jsonReport,
          },
          {
            filename: `registrations-${format(now, 'yyyy-MM-dd')}.csv`,
            content: registrationsCsv.buffer,
          },
        ],
      }
    );

    logger.info('✅ Daily report generated and sent');
  } catch (error) {
    logger.error('❌ Report job failed:', error);
    throw error;
  }
};