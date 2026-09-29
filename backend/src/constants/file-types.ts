export const FILE_TYPES = {
  // Images
  IMAGE: {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    GIF: 'image/gif',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml',
    BMP: 'image/bmp',
    TIFF: 'image/tiff',
  },
  
  // Documents
  DOCUMENT: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ODT: 'application/vnd.oasis.opendocument.text',
    RTF: 'application/rtf',
    TXT: 'text/plain',
  },
  
  // Spreadsheets
  SPREADSHEET: {
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ODS: 'application/vnd.oasis.opendocument.spreadsheet',
    CSV: 'text/csv',
  },
  
  // Presentations
  PRESENTATION: {
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ODP: 'application/vnd.oasis.opendocument.presentation',
  },
  
  // Archives
  ARCHIVE: {
    ZIP: 'application/zip',
    RAR: 'application/x-rar-compressed',
    TAR: 'application/x-tar',
    GZ: 'application/gzip',
    '7Z': 'application/x-7z-compressed',
  },
  
  // Audio
  AUDIO: {
    MP3: 'audio/mpeg',
    WAV: 'audio/wav',
    OGG: 'audio/ogg',
    FLAC: 'audio/flac',
    AAC: 'audio/aac',
    M4A: 'audio/mp4',
  },
  
  // Video
  VIDEO: {
    MP4: 'video/mp4',
    AVI: 'video/x-msvideo',
    MOV: 'video/quicktime',
    WMV: 'video/x-ms-wmv',
    FLV: 'video/x-flv',
    WEBM: 'video/webm',
    MKV: 'video/x-matroska',
  },
} as const;

export const FILE_EXTENSIONS = {
  // Images
  '.jpg': FILE_TYPES.IMAGE.JPEG,
  '.jpeg': FILE_TYPES.IMAGE.JPEG,
  '.png': FILE_TYPES.IMAGE.PNG,
  '.gif': FILE_TYPES.IMAGE.GIF,
  '.webp': FILE_TYPES.IMAGE.WEBP,
  '.svg': FILE_TYPES.IMAGE.SVG,
  '.bmp': FILE_TYPES.IMAGE.BMP,
  '.tiff': FILE_TYPES.IMAGE.TIFF,
  
  // Documents
  '.pdf': FILE_TYPES.DOCUMENT.PDF,
  '.doc': FILE_TYPES.DOCUMENT.DOC,
  '.docx': FILE_TYPES.DOCUMENT.DOCX,
  '.odt': FILE_TYPES.DOCUMENT.ODT,
  '.rtf': FILE_TYPES.DOCUMENT.RTF,
  '.txt': FILE_TYPES.DOCUMENT.TXT,
  
  // Spreadsheets
  '.xls': FILE_TYPES.SPREADSHEET.XLS,
  '.xlsx': FILE_TYPES.SPREADSHEET.XLSX,
  '.ods': FILE_TYPES.SPREADSHEET.ODS,
  '.csv': FILE_TYPES.SPREADSHEET.CSV,
  
  // Presentations
  '.ppt': FILE_TYPES.PRESENTATION.PPT,
  '.pptx': FILE_TYPES.PRESENTATION.PPTX,
  '.odp': FILE_TYPES.PRESENTATION.ODP,
  
  // Archives
  '.zip': FILE_TYPES.ARCHIVE.ZIP,
  '.rar': FILE_TYPES.ARCHIVE.RAR,
  '.tar': FILE_TYPES.ARCHIVE.TAR,
  '.gz': FILE_TYPES.ARCHIVE.GZ,
  '.7z': FILE_TYPES.ARCHIVE['7Z'],
  
  // Audio
  '.mp3': FILE_TYPES.AUDIO.MP3,
  '.wav': FILE_TYPES.AUDIO.WAV,
  '.ogg': FILE_TYPES.AUDIO.OGG,
  '.flac': FILE_TYPES.AUDIO.FLAC,
  '.aac': FILE_TYPES.AUDIO.AAC,
  '.m4a': FILE_TYPES.AUDIO.M4A,
  
  // Video
  '.mp4': FILE_TYPES.VIDEO.MP4,
  '.avi': FILE_TYPES.VIDEO.AVI,
  '.mov': FILE_TYPES.VIDEO.MOV,
  '.wmv': FILE_TYPES.VIDEO.WMV,
  '.flv': FILE_TYPES.VIDEO.FLV,
  '.webm': FILE_TYPES.VIDEO.WEBM,
  '.mkv': FILE_TYPES.VIDEO.MKV,
} as const;

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  SPREADSHEET: 10 * 1024 * 1024, // 10MB
  PRESENTATION: 20 * 1024 * 1024, // 20MB
  ARCHIVE: 50 * 1024 * 1024, // 50MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DEFAULT: 10 * 1024 * 1024, // 10MB
} as const;

export type FileType = typeof FILE_TYPES;
export type FileExtension = keyof typeof FILE_EXTENSIONS;