// Utility to parse past paper titles like:
// CAT1 E1 25-26 Operating Systems-BITE303L.pdf
// General pattern assumed:
// <examType> <slot?> <yy-yy?> <subject name>-<subject code>
// Some components may be missing; we attempt best-effort extraction.

export interface ParsedPastPaperMeta {
  examType?: string;      // e.g. CAT1, CAT2, CAT, ENDSEM
  slot?: string;          // e.g. E1, E2, M1
  academicYear?: string;  // e.g. 25-26 (two-digit start-end)
  subjectName?: string;   // e.g. Operating Systems
  subjectCode?: string;   // e.g. BITE303L
}

// Primary regex capturing expected groups (using positional groups for wider TS target support):
// 1 examType, 2 slot (optional), 3 year (optional), 4 subjectPart, 5 subjectCode
const FULL_PATTERN = /^([A-Za-z]+\d?)(?:\s+([A-Za-z]\d))?(?:\s+(\d{2}-\d{2}))?\s+(.+)-([A-Za-z0-9]+)(?:\.pdf)?$/i;

// Simpler fallback: 1 subjectPart, 2 subjectCode
const SIMPLE_PATTERN = /^(.+)-([A-Za-z0-9]+)(?:\.pdf)?$/i;

export function parsePastPaperTitle(rawTitle: string): ParsedPastPaperMeta {
  const title = rawTitle.trim();

  const fullMatch = title.match(FULL_PATTERN);
  if (fullMatch) {
    const examType = fullMatch[1];
    const slot = fullMatch[2];
    const year = fullMatch[3];
    const subjectPart = fullMatch[4];
    const subjectCode = fullMatch[5];
    const subjectName = cleanupSubjectName(subjectPart);
    return removeUndefined({
      examType: normalize(examType),
      slot: slot ? slot.toUpperCase() : undefined,
      academicYear: year,
      subjectName,
      subjectCode: subjectCode?.toUpperCase()
    });
  }

  const simpleMatch = title.match(SIMPLE_PATTERN);
  if (simpleMatch) {
    const subjectPart = simpleMatch[1];
    const subjectCode = simpleMatch[2];
    return removeUndefined({
      subjectName: cleanupSubjectName(subjectPart),
      subjectCode: subjectCode?.toUpperCase()
    });
  }

  // If everything fails return empty object (caller decides behavior)
  return {};
}

function cleanupSubjectName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  // Remove stray punctuation near end, collapse spaces, title case lightly
  const cleaned = name.replace(/[_]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return cleaned.split(' ').map(w => w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

function normalize(value: string | undefined): string | undefined {
  if (!value) return value;
  return value.toUpperCase();
}

function removeUndefined(obj: ParsedPastPaperMeta): ParsedPastPaperMeta {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '')) as ParsedPastPaperMeta;
}

export function buildMetaKey(meta: ParsedPastPaperMeta): string {
  return [meta.examType, meta.slot, meta.academicYear, meta.subjectCode].filter(Boolean).join('|');
}
