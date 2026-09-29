import { StatsService } from './stats.service';
import { ExportService } from './export.service';
import { logger } from '@config/logger';
import PDFDocument from 'pdfkit';

export class ReportService {
  private statsService: StatsService;
  private exportService: ExportService;

  constructor() {
    this.statsService = new StatsService();
    this.exportService = new ExportService();
  }

  async generateMonthlyReport(year: number, month: number): Promise<Buffer> {
    try {
      const stats = await this.statsService.getMonthlyStats(year, month);
      
      return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Title
        doc.fontSize(20).text(`Rapport Mensuel - ${new Date(year, month - 1).toLocaleString('fr', { month: 'long', year: 'numeric' })}`, { align: 'center' });
        doc.moveDown();

        // Summary
        doc.fontSize(14).text('Résumé', { underline: true });
        doc.fontSize(12);
        doc.text(`Nouveaux utilisateurs: ${stats.total.newUsers}`);
        doc.text(`Nouvelles inscriptions: ${stats.total.newRegistrations}`);
        doc.text(`Nouveaux membres Y2C: ${stats.total.newY2CMembers}`);
        doc.text(`Paiements: ${stats.total.newPayments}`);
        doc.text(`Revenus: ${stats.total.revenue} MGA`);
        doc.moveDown();

        // Daily breakdown
        doc.fontSize(14).text('Détail journalier', { underline: true });
        doc.fontSize(10);

        // Table headers
        const headers = ['Date', 'Inscriptions', 'Paiements', 'Revenus'];
        const colWidths = [100, 80, 80, 80];
        let y = doc.y;

        headers.forEach((h, i) => {
          doc.text(h, 30 + i * 100, y, { width: colWidths[i] });
        });

        doc.moveDown();
        y = doc.y;

        for (const day of stats.daily) {
          if (y > doc.page.height - 50) {
            doc.addPage();
            y = 30;
          }

          const date = new Date(day.date).toLocaleDateString();
          doc.text(date, 30, y, { width: colWidths[0] });
          doc.text(String(day.newRegistrations), 130, y, { width: colWidths[1] });
          doc.text(String(day.newPayments), 210, y, { width: colWidths[2] });
          doc.text(`${day.revenue} MGA`, 290, y, { width: colWidths[3] });

          y = doc.y;
          doc.moveDown();
        }

        doc.end();
      });
    } catch (error) {
      logger.error('Failed to generate monthly report:', error);
      throw error;
    }
  }

  async generateYearlyReport(year: number): Promise<Buffer> {
    try {
      const stats = await this.statsService.getYearlyStats(year);
      
      return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Title
        doc.fontSize(20).text(`Rapport Annuel - ${year}`, { align: 'center' });
        doc.moveDown();

        // Summary
        doc.fontSize(14).text('Résumé Annuel', { underline: true });
        doc.fontSize(12);
        doc.text(`Nouveaux utilisateurs: ${stats.totals.newUsers}`);
        doc.text(`Nouvelles inscriptions: ${stats.totals.newRegistrations}`);
        doc.text(`Nouveaux membres Y2C: ${stats.totals.newY2CMembers}`);
        doc.text(`Paiements: ${stats.totals.newPayments}`);
        doc.text(`Revenus totaux: ${stats.totals.revenue} MGA`);
        doc.moveDown();

        // Monthly breakdown
        doc.fontSize(14).text('Détail mensuel', { underline: true });
        doc.fontSize(10);

        const headers = ['Mois', 'Inscriptions', 'Paiements', 'Revenus'];
        const colWidths = [80, 80, 80, 100];
        let y = doc.y;

        headers.forEach((h, i) => {
          doc.text(h, 30 + i * 100, y, { width: colWidths[i] });
        });

        doc.moveDown();
        y = doc.y;

        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        for (let i = 0; i < stats.monthly.length; i++) {
          if (y > doc.page.height - 50) {
            doc.addPage();
            y = 30;
          }

          const month = stats.monthly[i];
          doc.text(monthNames[i], 30, y, { width: colWidths[0] });
          doc.text(String(month.total.newRegistrations), 110, y, { width: colWidths[1] });
          doc.text(String(month.total.newPayments), 190, y, { width: colWidths[2] });
          doc.text(`${month.total.revenue} MGA`, 270, y, { width: colWidths[3] });

          y = doc.y;
          doc.moveDown();
        }

        doc.end();
      });
    } catch (error) {
      logger.error('Failed to generate yearly report:', error);
      throw error;
    }
  }
}