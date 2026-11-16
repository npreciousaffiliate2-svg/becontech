import type { SchoolProfile } from '../context/AppContext.tsx';

export interface CsvColumn<T = any> {
  key: string;
  header: string;
  format?: (value: any, row: T, index: number) => string | number | null | undefined;
}

export interface ExportCsvOptions<T = any> {
  filename: string;
  columns: CsvColumn<T>[];
  data: T[];
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Industry-standard RFC 4180 CSV parser & downloader with UTF-8 BOM
 * so Microsoft Excel and Google Sheets render Naira (₦) and special characters cleanly.
 */
export function exportToCsv<T = any>({ filename, columns, data }: ExportCsvOptions<T>): void {
  const headerRow = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const bodyRows = data.map((row, rowIndex) =>
    columns
      .map((col) => {
        const rawVal = (row as any)?.[col.key];
        const formatted = col.format ? col.format(rawVal, row, rowIndex) : rawVal;
        return escapeCsvCell(formatted);
      })
      .join(',')
  );

  const csvString = '\uFEFF' + [headerRow, ...bodyRows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface PrintMetaItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface PrintTableColumn<T = any> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  highlight?: boolean;
  format?: (value: any, row: T, index: number) => string | number;
}

export interface PrintSignatureItem {
  title: string;
  subtitle?: string;
}

export interface PrintDocumentOptions<T = any> {
  title: string;
  badgeText: string;
  referenceNo?: string;
  issuedDate?: string;
  orientation?: 'portrait' | 'landscape';
  schoolProfile?: Partial<SchoolProfile> | null;
  officeSubtitle?: string;
  metaItems?: PrintMetaItem[];
  bodyHtml?: string;
  tableColumns?: PrintTableColumn<T>[];
  tableData?: T[];
  summaryNoteHtml?: string;
  stampText?: string;
  signatures?: PrintSignatureItem[];
  certificateStyle?: boolean;
}

function resolveLogoUrl(logoUrl?: string): string {
  const raw = logoUrl || '/BeonTech-Logo.png';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  return `${window.location.origin}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

export function triggerIframePrint(htmlDocument: string): void {
  const existing = document.getElementById('campusone-print-frame');
  if (existing) {
    existing.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'campusone-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(htmlDocument);
  doc.close();

  let printed = false;
  const executePrint = () => {
    if (printed) return;
    printed = true;
    const prevParentTitle = document.title;
    try {
      document.title = ' ';
      if (iframe.contentWindow?.document) {
        iframe.contentWindow.document.title = ' ';
      }
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      document.title = prevParentTitle;
      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }
  };

  const images = Array.from(doc.images || []);
  if (images.length === 0) {
    setTimeout(executePrint, 180);
  } else {
    let loaded = 0;
    const checkDone = () => {
      loaded += 1;
      if (loaded >= images.length) {
        setTimeout(executePrint, 120);
      }
    };
    images.forEach((img) => {
      if (img.complete) {
        checkDone();
      } else {
        img.addEventListener('load', checkDone, { once: true });
        img.addEventListener('error', checkDone, { once: true });
      }
    });
    setTimeout(executePrint, 800);
  }
}

/**
 * Generates and prints an industry-standard formatted institutional document
 * inside an isolated print frame (never prints the app sidebar, topbar, or background UI).
 */
export function printInstitutionalDocument<T = any>(options: PrintDocumentOptions<T>): void {
  const {
    title,
    badgeText,
    referenceNo,
    issuedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    orientation = 'portrait',
    schoolProfile,
    officeSubtitle,
    metaItems = [],
    bodyHtml = '',
    tableColumns,
    tableData,
    summaryNoteHtml = '',
    stampText,
    signatures = [
      { title: 'Registrar & Academic Secretary', subtitle: 'Academic Affairs Directorate' },
      { title: 'College Provost', subtitle: schoolProfile?.institutionName || 'Bethsaida College of Health Technology' },
    ],
    certificateStyle = false,
  } = options;

  const institutionName = schoolProfile?.institutionName || 'Bethsaida College of Health Technology';
  const campusAddress =
    schoolProfile?.campusAddress ||
    'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State';
  const officialEmail = schoolProfile?.officialEmail || 'info@becohtech.edu.ng';
  const officialPhone = schoolProfile?.officialPhone || '+234 907 578 9045';
  const websiteUrl = schoolProfile?.websiteUrl || 'www.becohtech.edu.ng';
  const logoSrc = resolveLogoUrl(schoolProfile?.logoUrl);

  const metaGridHtml =
    metaItems.length > 0
      ? `<div class="meta-grid">
          ${metaItems
            .map(
              (item) => `
            <div class="meta-item">
              <span class="meta-label">${escapeHtml(item.label)}</span>
              <span class="meta-value ${item.highlight ? 'meta-highlight' : ''}">${escapeHtml(item.value)}</span>
            </div>`
            )
            .join('')}
        </div>`
      : '';

  const tableHtml =
    tableColumns && tableData
      ? `<table class="data-table">
          <thead>
            <tr>
              ${tableColumns
                .map(
                  (col) =>
                    `<th class="align-${col.align || 'left'}">${escapeHtml(col.header)}</th>`
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${
              tableData.length === 0
                ? `<tr><td colspan="${tableColumns.length}" class="empty-cell">No records available</td></tr>`
                : tableData
                    .map(
                      (row, idx) => `
                  <tr>
                    ${tableColumns
                      .map((col) => {
                        const rawVal = (row as any)?.[col.key];
                        const val = col.format ? col.format(rawVal, row, idx) : rawVal ?? '—';
                        const cls = [
                          `align-${col.align || 'left'}`,
                          col.bold ? 'cell-bold' : '',
                          col.highlight ? 'cell-highlight' : '',
                        ]
                          .filter(Boolean)
                          .join(' ');
                        return `<td class="${cls}">${escapeHtml(val)}</td>`;
                      })
                      .join('')}
                  </tr>`
                    )
                    .join('')
            }
          </tbody>
        </table>`
      : '';

  const sigCols = signatures.length + (stampText ? 1 : 0);
  const signaturesHtml =
    signatures.length > 0
      ? `<div class="sig-grid" style="grid-template-columns: repeat(${sigCols}, minmax(0, 1fr));">
          ${signatures
            .map(
              (sig, idx) => `
            <div class="sig-block ${idx === signatures.length - 1 && !stampText ? 'sig-right' : ''}">
              <div class="sig-line"></div>
              <div class="sig-title">${escapeHtml(sig.title)}</div>
              ${sig.subtitle ? `<div class="sig-sub">${escapeHtml(sig.subtitle)}</div>` : ''}
            </div>`
            )
            .slice(0, 1)
            .join('')}
          ${
            stampText
              ? `<div class="sig-stamp-wrap">
                  <div class="sig-stamp">${escapeHtml(stampText)}</div>
                </div>`
              : ''
          }
          ${signatures
            .slice(1)
            .map(
              (sig, idx, arr) => `
            <div class="sig-block ${idx === arr.length - 1 ? 'sig-right' : ''}">
              <div class="sig-line"></div>
              <div class="sig-title">${escapeHtml(sig.title)}</div>
              ${sig.subtitle ? `<div class="sig-sub">${escapeHtml(sig.subtitle)}</div>` : ''}
            </div>`
            )
            .join('')}
        </div>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)} — ${escapeHtml(institutionName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4 ${orientation};
      margin: 0mm !important;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.5;
    }
    body {
      padding: 12mm 14mm;
    }
    .doc-shell {
      border: ${certificateStyle ? '4px double #0F7640' : '1px solid #cbd5e1'};
      border-radius: 4px;
      padding: ${certificateStyle ? '24px 28px' : '18px 20px'};
      background: #ffffff;
    }
    .letterhead {
      text-align: center;
      border-bottom: 2px solid #0F7640;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .crest {
      width: 52px;
      height: 52px;
      object-fit: contain;
      border-radius: 4px;
      margin: 0 auto 6px auto;
      display: block;
    }
    .inst-name {
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #093322;
      margin: 0;
    }
    .inst-address {
      font-size: 10px;
      color: #475569;
      margin: 2px 0 0 0;
    }
    .inst-contact {
      font-size: 9.5px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .office-sub {
      font-size: 10px;
      font-weight: 700;
      color: #0F7640;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 4px;
    }
    .badge-banner {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 4px;
      color: #0F7640;
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .ref-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #475569;
      padding-bottom: 10px;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .ref-bar strong {
      color: #0f172a;
      font-weight: 700;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      font-weight: 600;
    }
    .meta-value {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 1px;
    }
    .meta-highlight {
      color: #0F7640;
      font-weight: 800;
    }
    .doc-body {
      margin-bottom: 14px;
      color: #1e293b;
      font-size: 11px;
    }
    .doc-body p {
      margin: 0 0 8px 0;
    }
    .callout-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      margin: 10px 0;
    }
    .callout-green {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 4px;
      padding: 10px 12px;
      margin: 10px 0;
      color: #065f46;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10.5px;
      font-variant-numeric: tabular-nums;
    }
    .data-table thead {
      display: table-header-group;
    }
    .data-table tr {
      page-break-inside: avoid;
    }
    .data-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.04em;
      padding: 7px 8px;
      border: 1px solid #cbd5e1;
    }
    .data-table td {
      padding: 6.5px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .data-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .align-left { text-align: left; }
    .align-center { text-align: center; }
    .align-right { text-align: right; }
    .cell-bold { font-weight: 700; color: #0f172a; }
    .cell-highlight { font-weight: 800; color: #0F7640; }
    .empty-cell { text-align: center; padding: 16px; color: #64748b; }
    .summary-note {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 9px 12px;
      font-size: 10px;
      color: #334155;
      margin-bottom: 14px;
    }
    .sig-grid {
      display: grid;
      gap: 16px;
      align-items: end;
      margin-top: 26px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .sig-block {
      text-align: left;
    }
    .sig-right {
      text-align: right;
    }
    .sig-right .sig-line {
      margin-left: auto;
    }
    .sig-line {
      width: 140px;
      border-bottom: 1.5px solid #0f172a;
      margin-bottom: 5px;
      height: 22px;
    }
    .sig-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-sub {
      font-size: 9.5px;
      color: #64748b;
    }
    .sig-stamp-wrap {
      text-align: center;
    }
    .sig-stamp {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 14px;
      border: 1.5px dashed #0F7640;
      border-radius: 4px;
      background: #ecfdf5;
      color: #0F7640;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .audit-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="doc-shell">
    <div class="letterhead">
      <img class="crest" src="${escapeHtml(logoSrc)}" alt="College Crest" />
      <h1 class="inst-name">${escapeHtml(institutionName)}</h1>
      <p class="inst-address">${escapeHtml(campusAddress)}</p>
      <p class="inst-contact">Email: ${escapeHtml(officialEmail)} &bull; Tel: ${escapeHtml(officialPhone)} &bull; Web: ${escapeHtml(websiteUrl)}</p>
      ${officeSubtitle ? `<div class="office-sub">${escapeHtml(officeSubtitle)}</div>` : ''}
      <div class="badge-banner">${escapeHtml(badgeText)}</div>
    </div>

    <div class="ref-bar">
      <span>Document Ref: <strong>${escapeHtml(referenceNo || `BCHT/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`)}</strong></span>
      <span>Date Issued: <strong>${escapeHtml(issuedDate)}</strong></span>
    </div>

    ${metaGridHtml}
    ${bodyHtml ? `<div class="doc-body">${bodyHtml}</div>` : ''}
    ${tableHtml}
    ${summaryNoteHtml ? `<div class="summary-note">${summaryNoteHtml}</div>` : ''}
    ${signaturesHtml}

    <div class="audit-footer">
      <span>Official Institutional Record &bull; ${escapeHtml(institutionName)}</span>
      <span>Session: ${escapeHtml(schoolProfile?.activeSession || '2026/2027')} (${escapeHtml(schoolProfile?.activeSemester || 'Harmattan')})</span>
    </div>
  </div>
</body>
</html>`;

  triggerIframePrint(html);
}

export interface PrintableGraduationCertificate {
  fullName: string;
  matricNumber: string;
  programme: string;
  cgpa: number;
  diplomaClass: string;
  certSerial: string;
  schoolProfile?: Partial<SchoolProfile> | null;
}

/**
 * Prints the Official College Diploma & Graduation Certificate matching the exact
 * ceremonial double-bordered design in the Certificate Preview Modal.
 */
export function printGraduationCertificate(options: PrintableGraduationCertificate): void {
  const { fullName, matricNumber, programme, cgpa, diplomaClass, certSerial, schoolProfile } = options;
  const institutionName = (schoolProfile?.institutionName || 'Bethsaida College of Health Technology').replace(' Ltd', '');
  const campusAddress =
    schoolProfile?.campusAddress ||
    'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State, Nigeria';
  const logoSrc = resolveLogoUrl(schoolProfile?.logoUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title> </title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4 landscape;
      margin: 0mm !important;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #1e293b;
    }
    body {
      padding: 14mm 18mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cert-frame {
      width: 100%;
      border: 4px double #0F7640;
      border-radius: 4px;
      padding: 36px 44px;
      text-align: center;
      background: #ffffff;
    }
    .cert-crest {
      width: 68px;
      height: 68px;
      object-fit: contain;
      border-radius: 4px;
      margin: 0 auto 14px auto;
      display: block;
    }
    .cert-school {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #093322;
      margin: 0;
    }
    .cert-address {
      font-size: 11.5px;
      color: #64748b;
      margin: 5px 0 0 0;
    }
    .cert-badge {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 16px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 4px;
      color: #0F7640;
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .cert-body {
      padding: 24px 0 22px 0;
    }
    .cert-intro {
      font-size: 13px;
      font-style: italic;
      color: #64748b;
      margin: 0 0 8px 0;
    }
    .cert-student {
      font-size: 26px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .cert-matric {
      font-size: 13px;
      font-weight: 700;
      color: #0F7640;
      margin: 0 0 14px 0;
    }
    .cert-citation {
      font-size: 12.5px;
      color: #475569;
      max-width: 560px;
      margin: 0 auto 14px auto;
      line-height: 1.65;
    }
    .cert-programme {
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      color: #093322;
      margin: 0 0 14px 0;
    }
    .cert-class-pill {
      display: inline-block;
      padding: 5px 14px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 4px;
      color: #13A348;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .cert-footer {
      margin-top: 18px;
      padding-top: 22px;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: end;
    }
    .sig-left {
      text-align: left;
    }
    .sig-right {
      text-align: right;
    }
    .sig-line {
      width: 150px;
      border-bottom: 1.5px solid #334155;
      margin-bottom: 6px;
      height: 22px;
    }
    .sig-right .sig-line {
      margin-left: auto;
    }
    .sig-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-sub {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .seal-box {
      display: inline-block;
      padding: 7px 14px;
      border: 1.5px dashed #0F7640;
      background: #ecfdf5;
      color: #0F7640;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <img class="cert-crest" src="${escapeHtml(logoSrc)}" alt="College Crest" />
    <h1 class="cert-school">${escapeHtml(institutionName)}</h1>
    <p class="cert-address">${escapeHtml(campusAddress)}</p>
    <div class="cert-badge">Official Diploma of Graduation &bull; ${escapeHtml(certSerial)}</div>

    <div class="cert-body">
      <p class="cert-intro">This is to certify that</p>
      <h2 class="cert-student">${escapeHtml(fullName)}</h2>
      <p class="cert-matric">Matriculation No: ${escapeHtml(matricNumber)}</p>
      <p class="cert-citation">
        having completed the statutory academic curriculum, laboratory practicums, and accredited hospital clinical rotations, and passed all prescribed examinations, is hereby awarded the
      </p>
      <div class="cert-programme">Professional Diploma in ${escapeHtml(programme)}</div>
      <div class="cert-class-pill">Class of Diploma: ${escapeHtml(diplomaClass.toUpperCase())} (CGPA: ${cgpa.toFixed(2)})</div>
    </div>

    <div class="cert-footer">
      <div class="sig-left">
        <div class="sig-line"></div>
        <div class="sig-title">Registrar &amp; Secretary</div>
        <div class="sig-sub">Academic Senate</div>
      </div>
      <div>
        <span class="seal-box">Official Senate Seal</span>
      </div>
      <div class="sig-right">
        <div class="sig-line"></div>
        <div class="sig-title">College Provost</div>
        <div class="sig-sub">Chief Academic Officer</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  triggerIframePrint(html);
}

export interface PrintableIdCardStudent {
  fullName: string;
  matricNumber?: string;
  programme: string;
  level: string;
  bloodGroup?: string;
  genotype?: string;
  department?: string;
  avatarUrl?: string;
}

/**
 * Industry-standard CR80 / PVC Student Identity Card print sheet (Duplex Front + Back side).
 */
export function printStudentIdCards(
  cards: PrintableIdCardStudent[],
  schoolProfile?: Partial<SchoolProfile> | null
): void {
  const institutionName = (schoolProfile?.institutionName || 'Bethsaida College of Health Technology').replace(' Ltd', '');
  const sector = schoolProfile?.institutionalSector || 'College of Health Technology';
  const session = (schoolProfile?.activeSession || '2026/2027').replace(' Academic Session', '');
  const campusAddress =
    schoolProfile?.campusAddress ||
    'Ikolaba Aladan layout, off Ayegun Yemetu Road, Ogbomoso, Oyo State';
  const officialPhone = schoolProfile?.officialPhone || '+234 907 578 9045';
  const officialEmail = schoolProfile?.officialEmail || 'registrar@becohtech.edu.ng';
  const websiteUrl = schoolProfile?.websiteUrl || 'www.becohtech.edu.ng';
  const logoSrc = resolveLogoUrl(schoolProfile?.logoUrl);

  const barcodeWidths = [
    2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2,
    1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1,
  ];
  const barcodeBarsHtml = barcodeWidths
    .map(
      (w, idx) =>
        `<span class="${idx % 2 === 0 ? 'bar-ink' : 'bar-gap'}" style="width:${w}px;"></span>`
    )
    .join('');

  const cardsHtml = cards
    .map((s) => {
      const hasMatric = Boolean(s.matricNumber && s.matricNumber.trim() && s.matricNumber !== '—');
      const matricDisplay = hasMatric ? s.matricNumber! : 'MATRIC PENDING';
      const cleanProgramme = (s.programme || '').replace(/\s*\([^)]*\)\s*/g, '').trim();
      return `
    <div class="card-pair">
      <!-- FRONT SIDE (OBVERSE) -->
      <div class="id-card">
        <div class="side-label">FRONT SIDE (OBVERSE)</div>
        <div class="id-header">
          <div class="id-brand">
            <img class="id-logo" src="${escapeHtml(logoSrc)}" alt="Crest" />
            <div>
              <div class="id-school">${escapeHtml(institutionName)}</div>
              <div class="id-sector">${escapeHtml(sector)}</div>
            </div>
          </div>
          <span class="id-role">STUDENT</span>
        </div>
        <div class="id-body">
          <div class="id-main">
            ${
              s.avatarUrl
                ? `<img class="id-photo-img" src="${escapeHtml(resolveLogoUrl(s.avatarUrl))}" alt="${escapeHtml(s.fullName)}" />`
                : `<div class="id-photo">PASSPORT<br/>PHOTO</div>`
            }
            <div class="id-details">
              <div class="id-name">${escapeHtml(s.fullName)}</div>
              <div class="id-matric">${escapeHtml(matricDisplay)}</div>
              <div class="id-prog">${escapeHtml(cleanProgramme)}</div>
              <div class="id-meta">${escapeHtml(s.level)} &bull; Session ${escapeHtml(session)}</div>
            </div>
          </div>
          <div class="id-footer">
            <div class="id-barcode" aria-label="Student Verification Barcode">${barcodeBarsHtml}</div>
            <div class="id-exp">
              <span>EXPIRES</span>
              <strong>31 DEC 2028</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- BACK SIDE (REVERSE) -->
      <div class="id-card id-card-back">
        <div class="side-label">BACK SIDE (REVERSE)</div>
        <div class="back-strip">
          <span>OFFICIAL PROPERTY OF ${escapeHtml(institutionName.toUpperCase())}</span>
        </div>
        <div class="back-body">
          <div class="back-notice">
            <strong>LOST &amp; FOUND RETURN NOTICE:</strong> This identity card remains the statutory property of
            <strong>${escapeHtml(institutionName)}</strong>. It is strictly non-transferable and must be presented on
            demand to College Security, Clinical Preceptors, or Examination Invigilators. If found, please return to the
            <strong>Office of the Registrar</strong> at ${escapeHtml(campusAddress)}, the nearest Police Station, or contact
            <strong>${escapeHtml(officialPhone)}</strong> (${escapeHtml(officialEmail)}).
          </div>
          <div class="back-sigs">
            <div class="back-sig-box">
              <div class="back-sig-line"></div>
              <div class="back-sig-label">Holder's Signature</div>
            </div>
            <div class="back-sig-box back-sig-right">
              <div class="back-sig-line back-sig-signed">Registrar</div>
              <div class="back-sig-label">Authorized Registrar Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title> </title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4 portrait;
      margin: 0mm !important;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 12mm;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .sheet-grid {
      display: flex;
      flex-direction: column;
      gap: 6mm;
      align-items: center;
    }
    .card-pair {
      display: grid;
      grid-template-columns: repeat(2, 85.6mm);
      gap: 6mm;
      page-break-inside: avoid;
    }
    .side-label {
      font-size: 6.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #64748b;
      background: #f8fafc;
      padding: 2px 8px;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
    }
    .id-card {
      width: 85.6mm;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;
      background: #ffffff;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
    }
    .id-header {
      background: #0F7640;
      color: #ffffff;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .id-brand {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
    }
    .id-logo {
      width: 26px;
      height: 26px;
      background: #ffffff;
      border-radius: 3px;
      padding: 2px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .id-school {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      line-height: 1.2;
    }
    .id-sector {
      font-size: 8px;
      color: #d1fae5;
    }
    .id-role {
      background: #ffffff;
      color: #0F7640;
      font-size: 8px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .id-body {
      padding: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .id-main {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .id-photo-img {
      width: 52px;
      height: 64px;
      object-fit: cover;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      flex-shrink: 0;
      background: #ffffff;
    }
    .id-photo {
      width: 52px;
      height: 64px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 7.5px;
      font-weight: 700;
      color: #64748b;
      flex-shrink: 0;
    }
    .id-details {
      flex: 1;
      min-width: 0;
    }
    .id-name {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
    }
    .id-matric {
      font-size: 10px;
      font-weight: 800;
      color: #0F7640;
      margin-top: 2px;
    }
    .id-prog {
      font-size: 8.5px;
      font-weight: 500;
      color: #475569;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .id-meta {
      font-size: 8px;
      font-weight: 600;
      color: #334155;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .id-footer {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .id-barcode {
      display: inline-flex;
      align-items: flex-end;
      height: 20px;
      gap: 1px;
      background: #ffffff;
      padding: 2px 5px;
      border-radius: 2px;
      border: 1px solid #e2e8f0;
    }
    .bar-ink {
      height: 100%;
      background: #0f172a;
      display: inline-block;
    }
    .bar-gap {
      height: 100%;
      background: transparent;
      display: inline-block;
    }
    .id-exp {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      text-align: right;
      line-height: 1;
      gap: 1px;
    }
    .id-exp span {
      display: block;
      font-size: 6.5px;
      color: #94a3b8;
      font-weight: 700;
      line-height: 1;
      margin: 0;
    }
    .id-exp strong {
      display: block;
      font-size: 8.5px;
      color: #0f172a;
      font-weight: 800;
      line-height: 1.05;
      margin: 0;
    }
    /* BACK SIDE STYLES */
    .back-strip {
      background: #093322;
      color: #ffffff;
      padding: 6px 10px;
      font-size: 7.5px;
      font-weight: 800;
      text-align: center;
      letter-spacing: 0.05em;
    }
    .back-body {
      padding: 9px 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 6px;
    }
    .back-notice {
      font-size: 7.3px;
      line-height: 1.4;
      color: #334155;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 3px;
      padding: 6px 7px;
    }
    .back-emergency {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 7.2px;
      color: #0f172a;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 3px;
      padding: 4px 6px;
    }
    .back-sigs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding-top: 4px;
      border-top: 1px solid #e2e8f0;
      align-items: end;
    }
    .back-sig-box {
      text-align: left;
    }
    .back-sig-right {
      text-align: right;
    }
    .back-sig-line {
      height: 16px;
      border-bottom: 1px solid #334155;
      margin-bottom: 2px;
      font-size: 8px;
      font-style: italic;
      font-weight: 700;
      color: #0F7640;
      display: flex;
      align-items: flex-end;
    }
    .back-sig-right .back-sig-line {
      justify-content: flex-end;
    }
    .back-sig-label {
      font-size: 7px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="sheet-grid">${cardsHtml}</div>
</body>
</html>`;

  triggerIframePrint(html);
}
