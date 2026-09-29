// src/services/export.service.ts
import prisma from '../../prisma/client';
import { ExportType, ExportFormat, ExportStatus } from '@prisma/client';
import { ExportFilterDTO, ExportResultDTO } from '../types/dto/export.dto';
import { ApiError } from '../utils/ApiError';
import * as XLSX from 'xlsx';
import * as csv from 'fast-csv';
import PDFDocument from 'pdfkit';
import { createWriteStream, createReadStream } from 'fs';
import { mkdir, unlink, readFile, stat } from 'fs/promises';
import { join } from 'path';
import dayjs from 'dayjs';

export class ExportService {
  private EXPORT_DIR = process.env.EXPORT_DIR || './exports';

  constructor() {
    mkdir(this.EXPORT_DIR, { recursive: true }).catch(console.error);
  }

  // ─── Normalisation du format ──────────────────────────────
  private normalizeFormat(format: string): ExportFormat {
    const upper = format.toUpperCase();
    if (upper === 'CSV' || upper === 'EXCEL' || upper === 'PDF') return upper as ExportFormat;
    throw new Error('Format non supporté. Utilisez CSV, EXCEL ou PDF.');
  }

  // ─── Définition des colonnes par type (5-6 max) ───────────
  private getExportFields(type: ExportType): { key: string; label: string }[] {
    switch (type) {
      case 'FORMATIONS':
        return [
          { key: 'title', label: 'Titre' },
          { key: 'category', label: 'Catégorie' },
          { key: 'level', label: 'Niveau' },
          { key: 'duration', label: 'Durée' },
          { key: 'price', label: 'Prix (Ar)' },
          { key: 'isPublished', label: 'Publié' },
        ];
      case 'INSCRIPTIONS':
        return [
          { key: 'firstName', label: 'Prénom' },
          { key: 'lastName', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'formationTitle', label: 'Formation' },
          { key: 'status', label: 'Statut' },
          { key: 'paymentStatus', label: 'Paiement' },
        ];
      case 'PAIEMENTS':
        return [
          { key: 'paymentReference', label: 'Référence' },
          { key: 'amount', label: 'Montant (Ar)' },
          { key: 'paymentMethod', label: 'Méthode' },
          { key: 'status', label: 'Statut' },
          { key: 'paidAt', label: 'Payé le' },
          { key: 'email', label: 'Email' },
        ];
      case 'MEMBRES_Y2C':
        return [
          { key: 'name', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Téléphone' },
          { key: 'institution', label: 'Institution' },
          { key: 'badgeNumber', label: 'Badge' },
          { key: 'status', label: 'Statut' },
        ];
      case 'ARTICLES':
        return [
          { key: 'title', label: 'Titre' },
          { key: 'category', label: 'Catégorie' },
          { key: 'status', label: 'Statut' },
          { key: 'views', label: 'Vues' },
          { key: 'publishedAt', label: 'Publié le' },
          { key: 'authorName', label: 'Auteur' },
        ];
      case 'PROJETS':
        return [
          { key: 'title', label: 'Titre' },
          { key: 'category', label: 'Catégorie' },
          { key: 'status', label: 'Statut' },
          { key: 'budget', label: 'Budget (Ar)' },
          { key: 'startDate', label: 'Début' },
          { key: 'endDate', label: 'Fin' },
        ];
      case 'UTILISATEURS':
        return [
          { key: 'firstName', label: 'Prénom' },
          { key: 'lastName', label: 'Nom' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rôle' },
          { key: 'status', label: 'Statut' },
          { key: 'lastLogin', label: 'Dernière connexion' },
        ];
      default:
        return [];
    }
  }

  // ─── Récupération des données ──────────────────────────────
  private async fetchData(type: ExportType, filters: any): Promise<any[]> {
    const { dateFrom, dateTo, ...rest } = filters || {};
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    switch (type) {
      case 'FORMATIONS':
        return prisma.formation.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}) },
          include: { FormationSession: true, Registration: true },
        });
      case 'INSCRIPTIONS': {
        const data = await prisma.registration.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}) },
          include: { Formation: true, FormationSession: true },
        });
        return data.map(r => ({ ...r, formationTitle: r.Formation?.title || '' }));
      }
      case 'PAIEMENTS': {
        const data = await prisma.payment.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}) },
          include: { Registration: { include: { Formation: true } } },
        });
        return data.map(p => ({ ...p, email: p.Registration?.email || '' }));
      }
      case 'MEMBRES_Y2C':
        return prisma.y2CMember.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { joinedAt: dateFilter } : {}) },
        });
      case 'ARTICLES': {
        const data = await prisma.article.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}) },
          include: { User: true },
        });
        return data.map(a => ({ ...a, authorName: a.User ? `${a.User.firstName} ${a.User.lastName}` : '' }));
      }
      case 'PROJETS':
        return prisma.project.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}) },
        });
      case 'UTILISATEURS':
        return prisma.user.findMany({
          where: { ...rest, ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}) },
        });
      default:
        throw new Error('Type d\'export non supporté');
    }
  }

  // ─── Génération de fichier ──────────────────────────────────
  private async generateFile(type: ExportType, format: string, data: any[]): Promise<ExportResultDTO> {
    const normalizedFormat = this.normalizeFormat(format);
    const baseName = `${type.toLowerCase()}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}`;
    let fileName: string, fileUrl: string, fileSize: number;

    const fields = this.getExportFields(type);
    const filteredData = data.map(row => {
      const obj: any = {};
      fields.forEach(f => { obj[f.key] = row[f.key] !== undefined ? row[f.key] : ''; });
      return obj;
    });

    switch (normalizedFormat) {
      case 'CSV':
        fileName = `${baseName}.csv`;
        fileUrl = await this.generateCSV(filteredData, fields, fileName);
        break;
      case 'EXCEL':
        fileName = `${baseName}.xlsx`;
        fileUrl = await this.generateExcel(filteredData, fields, fileName);
        break;
      case 'PDF':
        fileName = `${baseName}.pdf`;
        fileUrl = await this.generatePDF(filteredData, fields, fileName, type);
        break;
      default:
        throw new Error('Format non supporté');
    }
    const stats = await stat(fileUrl);
    fileSize = stats.size;
    return { fileName, fileUrl, fileSize, format: normalizedFormat, type };
  }

  // ─── Export CSV ────────────────────────────────────────────
  private generateCSV(data: any[], fields: { key: string; label: string }[], fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = join(this.EXPORT_DIR, fileName);
      const ws = createWriteStream(path);
      const csvStream = csv.format({ headers: fields.map(f => f.label), delimiter: ';' });
      csvStream.pipe(ws);
      data.forEach(row => {
        const line: any = {};
        fields.forEach(f => { line[f.label] = row[f.key] !== undefined ? row[f.key] : ''; });
        csvStream.write(line);
      });
      csvStream.end();
      ws.on('finish', () => resolve(path));
      ws.on('error', reject);
    });
  }

  // ─── Export Excel ──────────────────────────────────────────
  private async generateExcel(data: any[], fields: { key: string; label: string }[], fileName: string): Promise<string> {
    const workbook = XLSX.utils.book_new();
    const worksheetData = data.map(row => {
      const obj: any = {};
      fields.forEach(f => { obj[f.label] = row[f.key] !== undefined ? row[f.key] : ''; });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const colWidths = fields.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    const path = join(this.EXPORT_DIR, fileName);
    XLSX.writeFile(workbook, path);
    return path;
  }

  // ─── Export PDF professionnel ──────────────────────────────
  private generatePDF(
    data: any[],
    fields: { key: string; label: string }[],
    fileName: string,
    type: ExportType
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = join(this.EXPORT_DIR, fileName);
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        bufferPages: true,
      });
      const stream = createWriteStream(path);
      doc.pipe(stream);

      // Couleurs
      const primaryColor = '#0b1a4a'; // Bleu marine
      const secondaryColor = '#e6edf5'; // Gris clair pour les lignes paires
      const borderColor = '#cccccc';
      const headerTextColor = '#ffffff';
      const textColor = '#333333';

      // --- En-tête du document ---
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(`Export ${type}`, { align: 'center' });
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}`, { align: 'center' });
      doc.moveDown(0.5);

      // Ligne de séparation
      doc.strokeColor(primaryColor)
        .lineWidth(2)
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.8);

      // --- Tableau ---
      const margin = 40;
      const pageWidth = 595; // A4 width
      const usableWidth = pageWidth - 2 * margin;
      const colCount = fields.length;
      const colWidth = usableWidth / colCount;

      let y = doc.y + 5;
      const rowHeight = 22;

      // Fonction pour dessiner l'en-tête du tableau
      const drawHeader = () => {
        // Fond coloré pour l'en-tête
        doc.fillColor(primaryColor)
          .rect(margin, y, usableWidth, rowHeight)
          .fill();

        doc.fillColor(headerTextColor)
          .fontSize(9)
          .font('Helvetica-Bold');

        fields.forEach((f, i) => {
          const x = margin + i * colWidth;
          doc.text(f.label, x + 4, y + 4, { width: colWidth - 8, align: 'left' });
          // Bordures (lignes verticales)
          doc.strokeColor(primaryColor)
            .lineWidth(0.5)
            .rect(x, y, colWidth, rowHeight)
            .stroke();
        });
        y += rowHeight;
      };

      // Dessiner l'en-tête
      drawHeader();

      // Lignes de données
      let rowCount = 0;
      data.forEach((row, index) => {
        // Pagination
        if (y > 720) {
          doc.addPage();
          y = 50;
          drawHeader();
        }

        // Alternance de couleurs
        const fillColor = index % 2 === 0 ? secondaryColor : '#ffffff';
        doc.fillColor(fillColor)
          .rect(margin, y, usableWidth, rowHeight)
          .fill();

        doc.fillColor(textColor)
          .fontSize(8)
          .font('Helvetica');

        fields.forEach((f, i) => {
          const x = margin + i * colWidth;
          let value = row[f.key] !== undefined && row[f.key] !== null ? String(row[f.key]) : '';
          if (value.length > 25) value = value.substring(0, 22) + '...';
          doc.text(value, x + 4, y + 4, { width: colWidth - 8, align: 'left' });
          // Bordures
          doc.strokeColor(borderColor)
            .lineWidth(0.5)
            .rect(x, y, colWidth, rowHeight)
            .stroke();
        });
        y += rowHeight;
        rowCount++;
      });

      // --- Pied de page ---
      // Ligne de séparation avant pied de page
      doc.moveDown(1);
      doc.strokeColor(primaryColor)
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Total : ${rowCount} enregistrement(s)`, { align: 'center' });
      doc.text(`Youth Computing - ${dayjs().format('YYYY')}`, { align: 'center' });

      // Numéros de page (en bas à droite)
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .fillColor('#999999')
          .text(`Page ${i + 1} / ${pages.count}`, 500, 780, { align: 'right' });
      }

      doc.end();
      stream.on('finish', () => resolve(path));
      stream.on('error', reject);
    });
  }

  // ─── Méthodes d’export direct ──────────────────────────────
  private async exportDirect(type: ExportType, format: string, filters: any) {
    const data = await this.fetchData(type, filters);
    const result = await this.generateFile(type, format, data);
    return {
      buffer: await readFile(result.fileUrl),
      filename: result.fileName,
      contentType: this.getContentType(result.format),
    };
  }

  async exportRegistrations(format: string, filters: any) {
    return this.exportDirect('INSCRIPTIONS', format, filters);
  }
  async exportMembers(format: string, filters: any) {
    return this.exportDirect('MEMBRES_Y2C', format, filters);
  }
  async exportPayments(format: string, filters: any) {
    return this.exportDirect('PAIEMENTS', format, filters);
  }
  async exportFormations(format: string, filters: any) {
    return this.exportDirect('FORMATIONS', format, filters);
  }
  async exportProjects(format: string, filters: any) {
    return this.exportDirect('PROJETS', format, filters);
  }
  async exportArticles(format: string, filters: any) {
    return this.exportDirect('ARTICLES', format, filters);
  }

  private getContentType(format: ExportFormat): string {
    switch (format) {
      case 'CSV': return 'text/csv';
      case 'EXCEL': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'PDF': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }

  // ─── Création d’un export asynchrone (avec historique) ──────
  async createExport(userId: string, data: ExportFilterDTO): Promise<{ historyId: string }> {
    const history = await prisma.exportHistory.create({
      data: {
        type: data.type,
        format: data.format,
        filters: data.filters,
        fileName: '',
        status: 'PENDING',
        requestedBy: userId,
      },
    });
    this.processExport(history.id).catch(console.error);
    return { historyId: history.id };
  }

  private async processExport(historyId: string) {
    try {
      await prisma.exportHistory.update({
        where: { id: historyId },
        data: { status: 'PROCESSING' },
      });
      const history = await prisma.exportHistory.findUnique({
        where: { id: historyId },
        include: { User: true },
      });
      if (!history) throw new Error('Export not found');
      const data = await this.fetchData(history.type, history.filters);
      const result = await this.generateFile(history.type, history.format, data);
      await prisma.exportHistory.update({
        where: { id: historyId },
        data: {
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    } catch (error: any) {
      await prisma.exportHistory.update({
        where: { id: historyId },
        data: { status: 'FAILED', error: error.message || 'Erreur lors de l\'export' },
      });
    }
  }

  // ─── Historique ──────────────────────────────────────────────
  async getHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.exportHistory.findMany({
        where: { requestedBy: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.exportHistory.count({ where: { requestedBy: userId } }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string, userId: string) {
    const history = await prisma.exportHistory.findFirst({
      where: { id, requestedBy: userId },
      include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!history) throw ApiError.notFound('Export introuvable');
    return history;
  }

  async deleteExport(id: string, userId: string) {
    const history = await this.getById(id, userId);
    if (history.fileUrl) {
      try { await unlink(history.fileUrl); } catch (e) {}
    }
    await prisma.exportHistory.delete({ where: { id } });
  }

  async getFileStream(id: string, userId: string) {
    const history = await this.getById(id, userId);
    if (history.status !== 'COMPLETED') throw ApiError.badRequest('Export non disponible');
    if (!history.fileUrl) throw ApiError.notFound('Fichier introuvable');
    const stream = createReadStream(history.fileUrl);
    return { stream, fileName: history.fileName };
  }

  async getStats(userId: string) {
    const total = await prisma.exportHistory.count({ where: { requestedBy: userId } });
    const byStatus = await prisma.exportHistory.groupBy({
      where: { requestedBy: userId },
      by: ['status'],
      _count: true,
    });
    const byType = await prisma.exportHistory.groupBy({
      where: { requestedBy: userId },
      by: ['type'],
      _count: true,
    });
    return {
      total,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {} as Record<ExportStatus, number>),
      byType: byType.reduce((acc, t) => ({ ...acc, [t.type]: t._count }), {} as Record<ExportType, number>),
    };
  }
}