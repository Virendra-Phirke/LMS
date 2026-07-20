/**
 * generateLibraryIDCard.ts
 * ------------------------------------------------------------------
 * Generates a print-ready Library ID Card as a PDF using pdf-lib,
 * with a signed, scannable QR verification code, swappable color
 * themes, and a customizable layout. Designed to plug straight into
 * a Node/TS library management system.
 *
 * Install dependencies:
 *   npm install pdf-lib qrcode
 *   npm install -D @types/qrcode
 *
 * Basic usage:
 *   import { generateLibraryIDCardPDF } from "./generateLibraryIDCard";
 *   import fs from "fs";
 *
 *   const pdfBytes = await generateLibraryIDCardPDF(
 *     {
 *       libraryName: "City Central Library",
 *       memberName: "Aditi Sharma",
 *       memberId: "LIB-2026-00417",
 *       department: "B.Sc. Computer Science",
 *       issueDate: "20-Jul-2026",
 *       expiryDate: "19-Jul-2027",
 *       photoBytes: fs.readFileSync("./photo.jpg"),
 *       photoType: "jpg",
 *       verificationBaseUrl: "https://library.example.com/verify",
 *       verificationSecret: process.env.CARD_SIGNING_SECRET,
 *     },
 *     {
 *       theme: "forestGreen",              // or a partial CardTheme object
 *       layout: "qrFocus",                 // or a partial CardLayout object
 *     }
 *   );
 *
 *   fs.writeFileSync("./id-card.pdf", pdfBytes);
 *
 * Verifying a scanned QR code later (e.g. in a front-desk scanner app):
 *   import { verifyVerificationData } from "./generateLibraryIDCard";
 *   const result = verifyVerificationData(scannedText, process.env.CARD_SIGNING_SECRET!);
 *   if (result.valid) { // grant access }
 * ------------------------------------------------------------------
 */

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import { createHmac } from "node:crypto";
import { URL } from "node:url";
import * as QRCode from "qrcode";

// ------------------------------------------------------------------
// Public data types
// ------------------------------------------------------------------

export interface LibraryMemberData {
  /** Name of the library / institution shown in the header band */
  libraryName: string;
  /** Optional subtitle under the library name, e.g. "Member Identity Card" */
  cardTitle?: string;
  /** Full name of the member */
  memberName: string;
  /** Unique member / library card ID */
  memberId: string;
  /** Department, class, or membership category */
  department?: string;
  /** Card issue date, pre-formatted string (e.g. "20-Jul-2026") */
  issueDate?: string;
  /** Card expiry date, pre-formatted string (e.g. "19-Jul-2027") */
  expiryDate?: string;
  /** Raw bytes of a member photo (jpg or png). Optional. */
  photoBytes?: Uint8Array | ArrayBuffer;
  /** Type of the supplied photo, required if photoBytes is set */
  photoType?: "jpg" | "png";
  /** Contact line shown in the footer, e.g. phone / website */
  contactLine?: string;
  /** Text encoded into the Code 39 barcode. Defaults to memberId. */
  barcodeValue?: string;

  // ---- QR verification -------------------------------------------------
  /**
   * Explicit raw string/URL to encode in the QR code. If set, this
   * overrides the auto-built verification payload below entirely.
   */
  qrData?: string;
  /**
   * Base URL of your verification endpoint, e.g.
   * "https://library.example.com/verify". When set (and `qrData` is
   * not), the QR encodes a full URL with id / exp / sig query params
   * that your backend can look up and validate.
   */
  verificationBaseUrl?: string;
  /**
   * Shared secret used to HMAC-sign the member ID + expiry date so the
   * QR payload can't be forged or edited without detection. Keep this
   * on the server only — never ship it to a client bundle.
   */
  verificationSecret?: string;

  /** Shortcut override for theme.primaryColor without building a full theme */
  accentColor?: [number, number, number];
}

/** Options passed alongside member data to control appearance. */
export interface GenerateOptions {
  /** A preset name from THEMES, or a partial CardTheme to merge over the default. */
  theme?: keyof typeof THEMES | Partial<CardTheme>;
  /** A preset name from LAYOUT_PRESETS, or a partial CardLayout to merge over the default. */
  layout?: keyof typeof LAYOUT_PRESETS | Partial<CardLayout>;
}

// ------------------------------------------------------------------
// Theme (color scheme) customization
// ------------------------------------------------------------------

export interface CardTheme {
  /** Header / footer band + primary accent color */
  primaryColor: [number, number, number];
  /** Thin accent underline / highlight color */
  secondaryColor: [number, number, number];
  /** Card background color */
  backgroundColor: [number, number, number];
  /** Main body text color */
  textColor: [number, number, number];
  /** Muted / label text color */
  mutedColor: [number, number, number];
  /** Text color used on top of the primary band */
  headerTextColor: [number, number, number];
  /** Photo placeholder / info box fill */
  panelColor: [number, number, number];
  /** Standard font family used across the card */
  font: "Helvetica" | "TimesRoman" | "Courier";
}

const classicBlue: CardTheme = {
  primaryColor: [0.106, 0.271, 0.549],
  secondaryColor: [0.85, 0.68, 0.15],
  backgroundColor: [1, 1, 1],
  textColor: [0.13, 0.13, 0.15],
  mutedColor: [0.45, 0.45, 0.47],
  headerTextColor: [1, 1, 1],
  panelColor: [0.96, 0.97, 0.99],
  font: "Helvetica",
};

export const THEMES = {
  classicBlue,
  forestGreen: {
    ...classicBlue,
    primaryColor: [0.1, 0.35, 0.24],
    secondaryColor: [0.75, 0.62, 0.2],
    panelColor: [0.95, 0.98, 0.96],
  } as CardTheme,
  crimsonRed: {
    ...classicBlue,
    primaryColor: [0.55, 0.11, 0.14],
    secondaryColor: [0.9, 0.75, 0.2],
    panelColor: [0.99, 0.95, 0.95],
  } as CardTheme,
  slateDark: {
    ...classicBlue,
    primaryColor: [0.16, 0.18, 0.22],
    secondaryColor: [0.35, 0.68, 0.78],
    panelColor: [0.94, 0.94, 0.95],
  } as CardTheme,
  royalPurple: {
    ...classicBlue,
    primaryColor: [0.33, 0.13, 0.49],
    secondaryColor: [0.85, 0.68, 0.25],
    panelColor: [0.97, 0.95, 0.99],
  } as CardTheme,
  sunsetOrange: {
    ...classicBlue,
    primaryColor: [0.82, 0.4, 0.11],
    secondaryColor: [0.16, 0.18, 0.22],
    panelColor: [1, 0.97, 0.93],
  } as CardTheme,
  tealOcean: {
    ...classicBlue,
    primaryColor: [0.04, 0.4, 0.42],
    secondaryColor: [0.9, 0.78, 0.35],
    panelColor: [0.93, 0.98, 0.98],
  } as CardTheme,
  roseGold: {
    ...classicBlue,
    primaryColor: [0.62, 0.3, 0.34],
    secondaryColor: [0.85, 0.72, 0.6],
    backgroundColor: [1, 0.99, 0.98],
    textColor: [0.28, 0.2, 0.2],
    panelColor: [0.99, 0.94, 0.93],
    headerTextColor: [1, 1, 1],
  } as CardTheme,
  graphiteMono: {
    ...classicBlue,
    primaryColor: [0.12, 0.12, 0.13],
    secondaryColor: [0.55, 0.55, 0.57],
    textColor: [0.12, 0.12, 0.13],
    mutedColor: [0.5, 0.5, 0.52],
    panelColor: [0.92, 0.92, 0.93],
    font: "Courier",
  } as CardTheme,
  amberGold: {
    ...classicBlue,
    primaryColor: [0.7, 0.52, 0.06],
    secondaryColor: [0.2, 0.2, 0.22],
    panelColor: [1, 0.98, 0.9],
  } as CardTheme,
  midnightNavy: {
    ...classicBlue,
    primaryColor: [0.05, 0.09, 0.24],
    secondaryColor: [0.65, 0.75, 0.95],
    backgroundColor: [0.97, 0.97, 0.99],
    panelColor: [0.92, 0.93, 0.97],
  } as CardTheme,
  mintFresh: {
    ...classicBlue,
    primaryColor: [0.13, 0.55, 0.42],
    secondaryColor: [0.98, 0.85, 0.4],
    panelColor: [0.93, 0.99, 0.96],
  } as CardTheme,
  academicMaroon: {
    ...classicBlue,
    primaryColor: [0.42, 0.09, 0.15],
    secondaryColor: [0.78, 0.68, 0.42],
    panelColor: [0.98, 0.94, 0.94],
    font: "TimesRoman",
  } as CardTheme,
} satisfies Record<string, CardTheme>;

function resolveTheme(input?: GenerateOptions["theme"]): CardTheme {
  if (!input) return classicBlue;
  if (typeof input === "string") return THEMES[input] ?? classicBlue;
  return { ...classicBlue, ...input };
}

// ------------------------------------------------------------------
// Layout customization
// ------------------------------------------------------------------

export interface CardLayout {
  /** Card width in inches */
  widthIn: number;
  /** Card height in inches */
  heightIn: number;
  /** Inner margin in points */
  margin: number;
  /** Header band height in points */
  headerHeight: number;
  /** Footer band height in points */
  footerHeight: number;
  /** Where the photo sits: left/right of the info column, above it, or hidden */
  photoPosition: "left" | "right" | "top" | "none";
  photoWidth: number;
  photoHeight: number;
  /** Whether to draw a signature line under the photo (left/right) or above the code zone */
  showSignatureLine: boolean;
  /** Whether to show the department/class row */
  showDepartment: boolean;
  /** Whether to show the issue/expiry date row */
  showDates: boolean;
  /** What to render in the bottom verification zone */
  bottomCode: "barcode" | "qrcode" | "both" | "none";
  /** Height reserved for the bottom code zone, in points */
  bottomZoneHeight: number;
  /** QR code square size in points (used for "qrcode" and "both") */
  qrSize: number;
}

const classicLayout: CardLayout = {
  widthIn: 3.375,
  heightIn: 2.125,
  margin: 10,
  headerHeight: 34,
  footerHeight: 16,
  photoPosition: "left",
  photoWidth: 62,
  photoHeight: 74,
  showSignatureLine: true,
  showDepartment: true,
  showDates: true,
  bottomCode: "barcode",
  bottomZoneHeight: 24,
  qrSize: 46,
};

export const LAYOUT_PRESETS = {
  classic: classicLayout,
  compact: {
    ...classicLayout,
    photoWidth: 52,
    photoHeight: 62,
    showDepartment: false,
    bottomZoneHeight: 20,
  } as CardLayout,
  qrFocus: {
    ...classicLayout,
    photoPosition: "right",
    bottomCode: "both",
    qrSize: 44,
    bottomZoneHeight: 46,
  } as CardLayout,
  qrOnly: {
    ...classicLayout,
    bottomCode: "qrcode",
    qrSize: 50,
    bottomZoneHeight: 52,
    showSignatureLine: false,
  } as CardLayout,
  portrait: {
    ...classicLayout,
    widthIn: 2.125,
    heightIn: 3.375,
    headerHeight: 46,
    photoPosition: "top",
    photoWidth: 90,
    photoHeight: 100,
    bottomCode: "qrcode",
    qrSize: 60,
    bottomZoneHeight: 66,
  } as CardLayout,
  minimalNoPhoto: {
    ...classicLayout,
    photoPosition: "none",
    showSignatureLine: false,
    bottomCode: "qrcode",
    qrSize: 40,
    bottomZoneHeight: 46,
  } as CardLayout,
  wideExecutive: {
    ...classicLayout,
    widthIn: 3.7,
    heightIn: 2.2,
    headerHeight: 40,
    photoWidth: 70,
    photoHeight: 84,
    bottomCode: "both",
    qrSize: 40,
    bottomZoneHeight: 40,
  } as CardLayout,
  largePhoto: {
    ...classicLayout,
    photoWidth: 80,
    photoHeight: 96,
    headerHeight: 30,
    bottomZoneHeight: 20,
  } as CardLayout,
  eventBadge: {
    ...classicLayout,
    widthIn: 3.5,
    heightIn: 5.0,
    headerHeight: 56,
    footerHeight: 20,
    photoPosition: "top",
    photoWidth: 110,
    photoHeight: 120,
    showDepartment: true,
    bottomCode: "qrcode",
    qrSize: 72,
    bottomZoneHeight: 80,
  } as CardLayout,
  squareKiosk: {
    ...classicLayout,
    widthIn: 2.6,
    heightIn: 2.6,
    headerHeight: 34,
    photoPosition: "top",
    photoWidth: 70,
    photoHeight: 70,
    showSignatureLine: false,
    bottomCode: "qrcode",
    qrSize: 54,
    bottomZoneHeight: 58,
  } as CardLayout,
} satisfies Record<string, CardLayout>;

function resolveLayout(input?: GenerateOptions["layout"]): CardLayout {
  if (!input) return classicLayout;
  if (typeof input === "string") return LAYOUT_PRESETS[input] ?? classicLayout;
  return { ...classicLayout, ...input };
}

// ------------------------------------------------------------------
// QR verification: signed payload helpers
// ------------------------------------------------------------------

/** Truncated HMAC-SHA256 signature, hex-encoded (16 chars ≈ 64 bits). */
function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 16);
}

/**
 * Builds the string encoded into the QR code. If `verificationSecret`
 * is provided, the payload is HMAC-signed so a scanner-side backend
 * can detect tampering (e.g. someone editing the member ID on a cloned
 * card). If `verificationBaseUrl` is also provided, the result is a
 * full URL with id / exp / sig query params instead of a bare string.
 */
export function buildVerificationString(
  memberId: string,
  expiryDate: string | undefined,
  secret?: string,
  baseUrl?: string
): string {
  const base = expiryDate ? `${memberId}|${expiryDate}` : memberId;
  const signature = secret ? signPayload(base, secret) : undefined;

  if (baseUrl) {
    const url = new URL(baseUrl);
    url.searchParams.set("id", memberId);
    if (expiryDate) url.searchParams.set("exp", expiryDate);
    if (signature) url.searchParams.set("sig", signature);
    return url.toString();
  }

  return signature ? `${base}|${signature}` : base;
}

/**
 * Verifies a scanned QR payload (either the plain "id|exp|sig" string
 * or the full verification URL) against the shared secret. Use this
 * server-side in your check-in / verification flow.
 */
export function verifyVerificationData(
  data: string,
  secret: string
): { valid: boolean; memberId?: string; expiryDate?: string } {
  try {
    if (data.startsWith("http://") || data.startsWith("https://")) {
      const url = new URL(data);
      const memberId = url.searchParams.get("id") ?? "";
      const expiryDate = url.searchParams.get("exp") ?? undefined;
      const sig = url.searchParams.get("sig") ?? "";
      const base = expiryDate ? `${memberId}|${expiryDate}` : memberId;
      return { valid: sig === signPayload(base, secret), memberId, expiryDate };
    }

    const parts = data.split("|");
    const sig = parts.pop() ?? "";
    const base = parts.join("|");
    const [memberId, expiryDate] = parts;
    return { valid: sig === signPayload(base, secret), memberId, expiryDate };
  } catch {
    return { valid: false };
  }
}

/** Renders a QR code to PNG bytes for embedding into the PDF. */
async function generateQrPngBytes(
  data: string,
  darkColor: [number, number, number]
): Promise<Uint8Array> {
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, "0");
  const dark = `#${toHex(darkColor[0])}${toHex(darkColor[1])}${toHex(darkColor[2])}`;

  const buffer: Buffer = await QRCode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark, light: "#ffffff" },
    width: 256,
  });
  return new Uint8Array(buffer);
}

// ------------------------------------------------------------------
// Code 39 barcode support (no external barcode library required)
// ------------------------------------------------------------------

const CODE39_PATTERNS: Record<string, string> = {
  "0": "111221211", "1": "211211112", "2": "112211112", "3": "212211111",
  "4": "111221112", "5": "211221111", "6": "112221111", "7": "111211212",
  "8": "211211211", "9": "112211211", A: "211112112", B: "112112112",
  C: "212112111", D: "111122112", E: "211122111", F: "112122111",
  G: "111112212", H: "211112211", I: "112112211", J: "111122211",
  K: "211111122", L: "112111122", M: "212111121", N: "111121122",
  O: "211121121", P: "112121121", Q: "111111222", R: "211111221",
  S: "112111221", T: "111121221", U: "221111112", V: "122111112",
  W: "222111111", X: "121121112", Y: "221121111", Z: "122121111",
  "-": "121111212", ".": "221111211", " ": "122111211", "*": "121121211",
};

function sanitizeForCode39(value: string): string {
  const upper = value.toUpperCase();
  let out = "";
  for (const ch of upper) out += CODE39_PATTERNS[ch] ? ch : "-";
  return out;
}

function drawCode39Barcode(
  page: PDFPage,
  rawValue: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB
): void {
  const value = `*${sanitizeForCode39(rawValue)}*`;

  let totalUnits = 0;
  for (const ch of value) {
    const pattern = CODE39_PATTERNS[ch] ?? CODE39_PATTERNS["-"];
    for (const digit of pattern) totalUnits += Number(digit);
    totalUnits += 1;
  }
  const unit = width / totalUnits;

  let cursor = x;
  for (const ch of value) {
    const pattern = CODE39_PATTERNS[ch] ?? CODE39_PATTERNS["-"];
    let isBar = true;
    for (const digit of pattern) {
      const barWidth = Number(digit) * unit;
      if (isBar) page.drawRectangle({ x: cursor, y, width: barWidth, height, color });
      cursor += barWidth;
      isBar = !isBar;
    }
    cursor += unit;
  }
}

// ------------------------------------------------------------------
// Small text helper: label above value, with truncation to fit
// ------------------------------------------------------------------

function drawLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  labelFont: PDFFont,
  valueFont: PDFFont,
  labelSize: number,
  valueSize: number,
  labelColor: RGB,
  valueColor: RGB,
  maxWidth: number
): void {
  page.drawText(label.toUpperCase(), { x, y, size: labelSize, font: labelFont, color: labelColor });

  let text = value;
  while (text.length > 0 && valueFont.widthOfTextAtSize(text, valueSize) > maxWidth) {
    text = text.slice(0, -1);
  }
  if (text !== value && text.length > 1) text = text.slice(0, -1) + "…";

  page.drawText(text, { x, y: y - valueSize - 1, size: valueSize, font: valueFont, color: valueColor });
}

// ------------------------------------------------------------------
// Main export
// ------------------------------------------------------------------

/**
 * Generates a single Library ID Card as PDF bytes, using the given
 * theme and layout (presets or partial overrides).
 */
export async function generateLibraryIDCardPDF(
  data: LibraryMemberData,
  options: GenerateOptions = {}
): Promise<Uint8Array> {
  const theme = resolveTheme(options.theme);
  const layout = resolveLayout(options.layout);

  if (data.accentColor) theme.primaryColor = data.accentColor;

  const CARD_WIDTH = layout.widthIn * 72;
  const CARD_HEIGHT = layout.heightIn * 72;
  const MARGIN = layout.margin;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([CARD_WIDTH, CARD_HEIGHT]);

  const primary = rgb(...theme.primaryColor);
  const secondary = rgb(...theme.secondaryColor);
  const background = rgb(...theme.backgroundColor);
  const dark = rgb(...theme.textColor);
  const gray = rgb(...theme.mutedColor);
  const headerText = rgb(...theme.headerTextColor);
  const panel = rgb(...theme.panelColor);

  const standardFont =
    theme.font === "TimesRoman" ? StandardFonts.TimesRoman : theme.font === "Courier" ? StandardFonts.Courier : StandardFonts.Helvetica;
  const standardFontBold =
    theme.font === "TimesRoman" ? StandardFonts.TimesRomanBold : theme.font === "Courier" ? StandardFonts.CourierBold : StandardFonts.HelveticaBold;

  const fontRegular = await pdfDoc.embedFont(standardFont);
  const fontBold = await pdfDoc.embedFont(standardFontBold);

  // ---- Card background ----
  page.drawRectangle({ x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT, color: background });

  // ---- Header band ----
  page.drawRectangle({
    x: 0, y: CARD_HEIGHT - layout.headerHeight, width: CARD_WIDTH, height: layout.headerHeight, color: primary,
  });
  page.drawRectangle({
    x: 0, y: CARD_HEIGHT - layout.headerHeight - 2, width: CARD_WIDTH, height: 2, color: secondary,
  });
  page.drawText(data.libraryName, {
    x: MARGIN, y: CARD_HEIGHT - 16, size: 11, font: fontBold, color: headerText,
  });
  page.drawText((data.cardTitle ?? "Member Identity Card").toUpperCase(), {
    x: MARGIN, y: CARD_HEIGHT - 27, size: 6.5, font: fontRegular, color: headerText,
  });

  // ---- Footer band ----
  page.drawRectangle({ x: 0, y: 0, width: CARD_WIDTH, height: layout.footerHeight, color: primary });
  if (data.contactLine) {
    page.drawText(data.contactLine, { x: MARGIN, y: 5, size: 5.5, font: fontRegular, color: headerText });
  }

  // ---- Geometry ----
  const contentTop = CARD_HEIGHT - layout.headerHeight;
  const bottomZoneTop = layout.footerHeight + 4 + layout.bottomZoneHeight;

  let photoX = MARGIN;
  let photoY = 0;
  let infoX = MARGIN;
  let infoWidth = CARD_WIDTH - MARGIN * 2;
  let infoTop = contentTop - 12;

  if (layout.photoPosition !== "none") {
    if (layout.photoPosition === "left") {
      photoX = MARGIN;
      photoY = contentTop - MARGIN - layout.photoHeight;
      infoX = photoX + layout.photoWidth + 10;
      infoWidth = CARD_WIDTH - infoX - MARGIN;
      infoTop = contentTop - 12;
    } else if (layout.photoPosition === "right") {
      photoX = CARD_WIDTH - MARGIN - layout.photoWidth;
      photoY = contentTop - MARGIN - layout.photoHeight;
      infoX = MARGIN;
      infoWidth = photoX - 10 - MARGIN;
      infoTop = contentTop - 12;
    } else if (layout.photoPosition === "top") {
      photoX = (CARD_WIDTH - layout.photoWidth) / 2;
      photoY = contentTop - MARGIN - layout.photoHeight;
      infoX = MARGIN;
      infoWidth = CARD_WIDTH - MARGIN * 2;
      infoTop = photoY - 14;
    }

    // ---- Photo box ----
    page.drawRectangle({
      x: photoX, y: photoY, width: layout.photoWidth, height: layout.photoHeight,
      color: panel, borderColor: primary, borderWidth: 1,
    });

    if (data.photoBytes) {
      const image = data.photoType === "png" ? await pdfDoc.embedPng(data.photoBytes) : await pdfDoc.embedJpg(data.photoBytes);
      const scale = Math.max(layout.photoWidth / image.width, layout.photoHeight / image.height);
      const drawW = image.width * scale;
      const drawH = image.height * scale;
      page.drawImage(image, {
        x: photoX + (layout.photoWidth - drawW) / 2,
        y: photoY + (layout.photoHeight - drawH) / 2,
        width: drawW,
        height: drawH,
      });
      page.drawRectangle({
        x: photoX, y: photoY, width: layout.photoWidth, height: layout.photoHeight,
        borderColor: primary, borderWidth: 1,
      });
    } else {
      page.drawText("PHOTO", {
        x: photoX + layout.photoWidth / 2 - 12, y: photoY + layout.photoHeight / 2 - 3,
        size: 8, font: fontRegular, color: gray,
      });
    }

    // ---- Signature line under the photo (left/right layouts only) ----
    if (layout.showSignatureLine && layout.photoPosition !== "top") {
      const sigY = photoY - 2;
      page.drawLine({
        start: { x: photoX, y: sigY }, end: { x: photoX + layout.photoWidth, y: sigY },
        thickness: 0.5, color: gray,
      });
      page.drawText("Signature", {
        x: photoX + layout.photoWidth / 2 - 15, y: sigY - 7, size: 5, font: fontRegular, color: gray,
      });
    }
  } else {
    infoTop = contentTop - 14;
  }

  // ---- Info column ----
  let infoY = infoTop;

  page.drawText(data.memberName, { x: infoX, y: infoY, size: 10.5, font: fontBold, color: dark });
  infoY -= 13;

  drawLabelValue(page, "Member ID", data.memberId, infoX, infoY, fontRegular, fontBold, 5.5, 8, gray, primary, infoWidth);
  infoY -= 15;

  if (layout.showDepartment && data.department) {
    drawLabelValue(page, "Department / Class", data.department, infoX, infoY, fontRegular, fontRegular, 5.5, 7.5, gray, dark, infoWidth);
    infoY -= 15;
  }

  if (layout.showDates && (data.issueDate || data.expiryDate)) {
    const halfWidth = infoWidth / 2 - 4;
    if (data.issueDate) {
      drawLabelValue(page, "Issued", data.issueDate, infoX, infoY, fontRegular, fontRegular, 5, 7, gray, dark, halfWidth);
    }
    if (data.expiryDate) {
      drawLabelValue(page, "Valid Till", data.expiryDate, infoX + halfWidth + 8, infoY, fontRegular, fontBold, 5, 7, gray, primary, halfWidth);
    }
  }

  // ---- Signature line for "top" photo / "none" photo layouts ----
  if (layout.showSignatureLine && (layout.photoPosition === "top" || layout.photoPosition === "none")) {
    const sigY = bottomZoneTop + 10;
    const sigWidth = 90;
    const sigX = (CARD_WIDTH - sigWidth) / 2;
    page.drawLine({ start: { x: sigX, y: sigY }, end: { x: sigX + sigWidth, y: sigY }, thickness: 0.5, color: gray });
    page.drawText("Signature", { x: CARD_WIDTH / 2 - 15, y: sigY - 7, size: 5, font: fontRegular, color: gray });
  }

  // ---- Bottom verification zone: barcode / QR / both ----
  if (layout.bottomCode !== "none") {
    const zoneY = layout.footerHeight + 4;
    const zoneX = MARGIN;
    const zoneWidth = CARD_WIDTH - MARGIN * 2;

    const verificationValue =
      data.qrData ?? buildVerificationString(data.memberId, data.expiryDate, data.verificationSecret, data.verificationBaseUrl);

    if (layout.bottomCode === "barcode") {
      const barcodeHeight = layout.bottomZoneHeight - 8;
      drawCode39Barcode(page, data.barcodeValue ?? data.memberId, zoneX, zoneY, zoneWidth, barcodeHeight, dark);
      const label = data.barcodeValue ?? data.memberId;
      page.drawText(label, {
        x: CARD_WIDTH / 2 - fontRegular.widthOfTextAtSize(label, 6) / 2, y: zoneY - 7, size: 6, font: fontRegular, color: dark,
      });
    } else if (layout.bottomCode === "qrcode") {
      const qrBytes = await generateQrPngBytes(verificationValue, theme.textColor);
      const qrImage = await pdfDoc.embedPng(qrBytes);
      const qrX = (CARD_WIDTH - layout.qrSize) / 2;
      page.drawImage(qrImage, { x: qrX, y: zoneY, width: layout.qrSize, height: layout.qrSize });
    } else if (layout.bottomCode === "both") {
      const qrX = CARD_WIDTH - MARGIN - layout.qrSize;
      const barcodeWidth = qrX - 10 - zoneX;
      const barcodeHeight = Math.min(layout.qrSize, layout.bottomZoneHeight) - 8;

      drawCode39Barcode(page, data.barcodeValue ?? data.memberId, zoneX, zoneY + (layout.qrSize - barcodeHeight) / 2, barcodeWidth, barcodeHeight, dark);
      page.drawText(data.barcodeValue ?? data.memberId, {
        x: zoneX, y: zoneY - 7, size: 5.5, font: fontRegular, color: dark,
      });

      const qrBytes = await generateQrPngBytes(verificationValue, theme.textColor);
      const qrImage = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrImage, { x: qrX, y: zoneY, width: layout.qrSize, height: layout.qrSize });
    }
  }

  return pdfDoc.save();
}

// ------------------------------------------------------------------
// Convenience: generate a printable sheet with multiple cards laid
// out on A4 for batch-printing (optional helper).
// ------------------------------------------------------------------

export async function generateLibraryIDCardsSheetPDF(
  members: LibraryMemberData[],
  options: GenerateOptions = {},
  columns = 2
): Promise<Uint8Array> {
  const layout = resolveLayout(options.layout);
  const CARD_WIDTH = layout.widthIn * 72;
  const CARD_HEIGHT = layout.heightIn * 72;

  const sheet = await PDFDocument.create();
  const pageMargin = 24;
  const gap = 12;
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;
  const rowsPerPage = Math.floor((A4_HEIGHT - pageMargin * 2) / (CARD_HEIGHT + gap));
  const cardsPerPage = Math.max(1, columns * rowsPerPage);

  for (let i = 0; i < members.length; i += cardsPerPage) {
    const page = sheet.addPage([A4_WIDTH, A4_HEIGHT]);
    const batch = members.slice(i, i + cardsPerPage);

    for (let j = 0; j < batch.length; j++) {
      const col = j % columns;
      const row = Math.floor(j / columns);
      const x = pageMargin + col * (CARD_WIDTH + gap);
      const y = A4_HEIGHT - pageMargin - CARD_HEIGHT - row * (CARD_HEIGHT + gap);

      const cardBytes = await generateLibraryIDCardPDF(batch[j], options);
      const cardDoc = await PDFDocument.load(cardBytes);
      const [embeddedPage] = await sheet.embedPdf(cardDoc, [0]);
      page.drawPage(embeddedPage, { x, y, width: CARD_WIDTH, height: CARD_HEIGHT });
    }
  }

  return sheet.save();
}
