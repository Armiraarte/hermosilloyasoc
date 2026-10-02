import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib';
import { Dossier } from '../types';

const shareTemplatePdfUrl = new URL('../../plantilla/PLANTILLA_ACCESOS.pdf', import.meta.url).href;

type PdfTextRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PdfTemplatePlacement = {
  pageIndex: number;
  rect: PdfTextRect;
};

const SHARE_TEMPLATE_LAYOUT: Record<'dossierCode' | 'accessCode', PdfTemplatePlacement> = {
  // Si la plantilla cambia, actualiza estas coordenadas.
  dossierCode: {
    pageIndex: 0,
    rect: { x: 108, y: 383, width: 235, height: 50 },
  },
  accessCode: {
    pageIndex: 0,
    rect: { x: 443, y: 383, width: 235, height: 50 },
  },
};

const PDF_FIELD_INSET_X = 18;
const PDF_FIELD_FONT_SIZE = 12;
const PDF_FIELD_MIN_FONT_SIZE = 8;
const PDF_FIELD_COLOR = rgb(0, 0, 0);

const normalizeOptionalValue = (value?: string | null) => {
  const normalized = (value ?? '').trim();
  return normalized;
};

const normalizeValue = (value?: string | null, fallback = 'Sin registro') => {
  const normalized = normalizeOptionalValue(value);
  return normalized || fallback;
};

const sanitizeFileToken = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

const loadShareTemplate = async (): Promise<ArrayBuffer> => {
  const response = await fetch(shareTemplatePdfUrl);
  if (!response.ok) {
    throw new Error('No se pudo cargar la plantilla PDF de accesos.');
  }

  return response.arrayBuffer();
};

const resolveRequiredCode = (value: string | null | undefined, label: string) => {
  const normalized = normalizeOptionalValue(value);
  if (!normalized) {
    throw new Error(`No se encontro el ${label} para generar el PDF.`);
  }

  return normalized;
};

const getTemplatePage = (
  pdfDoc: PDFDocument,
  placement: PdfTemplatePlacement
) => {
  const page = pdfDoc.getPages()[placement.pageIndex];
  if (!page) {
    throw new Error('No se encontro la pagina esperada en la plantilla PDF de accesos.');
  }

  return page;
};

const stripTemplateFormArtifacts = (pdfDoc: PDFDocument) => {
  pdfDoc.getPages().forEach((page) => {
    page.node.delete(PDFName.of('Annots'));
  });

  pdfDoc.catalog.delete(PDFName.of('AcroForm'));
};

const fitFontSizeToWidth = (
  text: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  maxWidth: number,
  defaultSize = PDF_FIELD_FONT_SIZE,
  minSize = PDF_FIELD_MIN_FONT_SIZE
) => {
  let size = defaultSize;

  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }

  return size;
};

const drawCenteredFieldText = (
  page: Awaited<ReturnType<PDFDocument['getPages']>>[number],
  text: string | null | undefined,
  rect: { x: number; y: number; width: number; height: number },
  font: Awaited<ReturnType<PDFDocument['embedFont']>>
) => {
  const normalizedText = normalizeOptionalValue(text);
  if (!normalizedText) {
    return;
  }

  const availableWidth = Math.max(rect.width - PDF_FIELD_INSET_X * 2, 1);
  const fontSize = fitFontSizeToWidth(normalizedText, font, availableWidth);
  const textWidth = font.widthOfTextAtSize(normalizedText, fontSize);
  const textHeight = font.heightAtSize(fontSize);
  const x = rect.x + (rect.width - textWidth) / 2;
  const y = rect.y + (rect.height - textHeight) / 2 + 1;

  page.drawText(normalizedText, {
    x,
    y,
    size: fontSize,
    font,
    color: PDF_FIELD_COLOR,
  });
};

export const buildDossierShareSubject = (dossier: Dossier) =>
  `Acceso al expediente ${normalizeValue(dossier.id)}`;

export const buildDossierShareMessage = (dossier: Dossier) => {
  const dossierCode = normalizeValue(dossier.id);

  return [
    `Comparto la plantilla de acceso del expediente ${dossierCode}.`,
    `Cliente: ${normalizeValue(dossier.clientName)}`,
    `Expediente: ${normalizeValue(dossier.title)}`,
    `Codigo de expediente: ${dossierCode}`,
    `Codigo de acceso: ${normalizeValue(dossier.clientAccessCode)}`,
    `Juzgado: ${normalizeValue(dossier.courtNumber)}`,
    `Distrito judicial: ${normalizeValue(dossier.judicialDistrict)}`,
    'Adjunto el PDF con los codigos cargados para referencia y seguimiento.',
  ].join('\n');
};

export const buildDossierShareWhatsAppMessage = (dossier: Dossier) =>
  [
    '*Sistema de Expedientes*',
    '',
    'Estimado(a),',
    '',
    'Le compartimos sus códigos de acceso para consultar su expediente de forma segura.',
    '',
    `*Código de Expediente:* \`${normalizeValue(dossier.id)}\``,
    `*Código de Acceso:* \`${normalizeValue(dossier.clientAccessCode)}\``,
    '',
    'Ingrese al sistema desde:',
    'http://www.hermosilloyasoc.com',
    '',
    'Por su seguridad, estos códigos son de uso personal y confidencial. Le recomendamos no compartirlos con terceros.',
    '',
    'Si requiere apoyo para acceder a su expediente, con gusto podemos asistirle.',
  ].join('\n');

export const buildDossierShareMailtoLink = (dossier: Dossier) => {
  const recipient = encodeURIComponent(normalizeOptionalValue(dossier.clientEmail));
  const subject = encodeURIComponent(buildDossierShareSubject(dossier));
  const body = encodeURIComponent(`${buildDossierShareMessage(dossier)}\n\nAdjunto el PDF de acceso al expediente.`);
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
};

export const buildDossierShareWhatsAppLink = (dossier: Dossier) =>
  `https://wa.me/?text=${encodeURIComponent(buildDossierShareWhatsAppMessage(dossier))}`;

export const downloadDossierSharePdf = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const createDossierSharePdf = async (dossier: Dossier): Promise<File> => {
  const dossierCode = resolveRequiredCode(dossier.id, 'codigo de expediente');
  const accessCode = resolveRequiredCode(dossier.clientAccessCode, 'codigo de acceso');
  const templateBytes = await loadShareTemplate();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  stripTemplateFormArtifacts(pdfDoc);

  drawCenteredFieldText(
    getTemplatePage(pdfDoc, SHARE_TEMPLATE_LAYOUT.dossierCode),
    dossierCode,
    SHARE_TEMPLATE_LAYOUT.dossierCode.rect,
    font
  );
  drawCenteredFieldText(
    getTemplatePage(pdfDoc, SHARE_TEMPLATE_LAYOUT.accessCode),
    accessCode,
    SHARE_TEMPLATE_LAYOUT.accessCode.rect,
    font
  );

  const fileName = `EXPEDIENTE_${sanitizeFileToken(dossierCode || 'SIN_CODIGO')}.pdf`;
  const pdfBytes = await pdfDoc.save({ updateFieldAppearances: false });
  return new File([pdfBytes], fileName, { type: 'application/pdf' });
};
