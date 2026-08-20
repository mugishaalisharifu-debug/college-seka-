export type EducationCategory =
  | "Nursery"
  | "Primary"
  | "Lower Secondary"
  | "TVET";

export interface ClassLevelOption {
  value: string;
  label: string;
  category: EducationCategory;
}

export interface RequiredDocument {
  key: string;
  label: string;
  description: string;
  accept: string;
  optional?: boolean;
}

export const CLASS_LEVEL_OPTIONS: ClassLevelOption[] = [
  { value: "N1", label: "Nursery 1 (N1)", category: "Nursery" },
  { value: "N2", label: "Nursery 2 (N2)", category: "Nursery" },
  { value: "N3", label: "Nursery 3 (N3)", category: "Nursery" },
  { value: "P1", label: "Primary 1 (P1)", category: "Primary" },
  { value: "P2", label: "Primary 2 (P2)", category: "Primary" },
  { value: "P3", label: "Primary 3 (P3)", category: "Primary" },
  { value: "P4", label: "Primary 4 (P4)", category: "Primary" },
  { value: "P5", label: "Primary 5 (P5)", category: "Primary" },
  { value: "P6", label: "Primary 6 (P6)", category: "Primary" },
  { value: "S1", label: "Senior 1 (S1)", category: "Lower Secondary" },
  { value: "S2", label: "Senior 2 (S2)", category: "Lower Secondary" },
  { value: "S3", label: "Senior 3 (S3)", category: "Lower Secondary" },
  { value: "L3", label: "TVET Level 3 (L3)", category: "TVET" },
  { value: "L4", label: "TVET Level 4 (L4)", category: "TVET" },
  { value: "L5", label: "TVET Level 5 (L5)", category: "TVET" },
  {
    value: "STP",
    label: "Short-Term Training Program",
    category: "TVET",
  },
];

export const TVET_TRADES: string[] = [
  "Accounting",
  "Agriculture",
  "Food Processing",
  "Mechanics",
  "Tailoring",
  "Culinary Arts",
  "Not Available",
];

const PASSPORT_PHOTO: RequiredDocument = {
  key: "passportPhoto",
  label: "Passport Photograph",
  description: "Recent passport-sized photo with a white background",
  accept: "image/*",
};

const BIRTH_CERTIFICATE: RequiredDocument = {
  key: "birthCertificate",
  label: "Birth Certificate",
  description: "Official birth certificate or affidavit (Nursery only)",
  accept: "image/*,.pdf",
};

const IMMUNIZATION_RECORD: RequiredDocument = {
  key: "immunizationRecord",
  label: "Immunization / Health Record",
  description: "Child health card showing vaccination history",
  accept: "image/*,.pdf",
};

const PREVIOUS_REPORT: RequiredDocument = {
  key: "previousReport",
  label: "Previous School Report",
  description: "Most recent end-of-year school report card",
  accept: "image/*,.pdf",
};

const PLE_RESULT_SLIP: RequiredDocument = {
  key: "pleResultSlip",
  label: "P6 National Exam (PLE) Result Slip",
  description: "Primary Leaving Examination result slip issued by NESA",
  accept: "image/*,.pdf",
};

const OLEVEL_RESULT_SLIP: RequiredDocument = {
  key: "olevelResultSlip",
  label: "S3 National Exam (O-Level) Result Slip",
  description:
    "Ordinary Level result slip issued by NESA — mandatory for TVET registration",
  accept: "image/*,.pdf",
};

const TVET_TRANSCRIPT: RequiredDocument = {
  key: "tvetTranscript",
  label: "Previous TVET Level Transcript",
  description: "Transcript proving completion of the preceding TVET level",
  accept: "image/*,.pdf",
};

const NATIONAL_ID: RequiredDocument = {
  key: "nationalId",
  label: "National ID",
  description: "Identification document of the trainee",
  accept: "image/*,.pdf",
};

const TRANSFER_LETTER: RequiredDocument = {
  key: "transferLetter",
  label: "Transfer Letter",
  description: "Only if transferring from another school",
  accept: "image/*,.pdf",
  optional: true,
};

const NURSERY_DOCS = [BIRTH_CERTIFICATE, PASSPORT_PHOTO, IMMUNIZATION_RECORD];

export const REQUIRED_DOCUMENTS_BY_LEVEL: Record<string, RequiredDocument[]> = {
  N1: NURSERY_DOCS,
  N2: NURSERY_DOCS,
  N3: NURSERY_DOCS,
  P1: [PASSPORT_PHOTO, IMMUNIZATION_RECORD],
  P2: [PASSPORT_PHOTO, PREVIOUS_REPORT],
  P3: [PASSPORT_PHOTO, PREVIOUS_REPORT],
  P4: [PASSPORT_PHOTO, PREVIOUS_REPORT],
  P5: [PASSPORT_PHOTO, PREVIOUS_REPORT],
  P6: [PASSPORT_PHOTO, PREVIOUS_REPORT],
  S1: [PASSPORT_PHOTO, PLE_RESULT_SLIP, TRANSFER_LETTER],
  S2: [PASSPORT_PHOTO, PREVIOUS_REPORT, TRANSFER_LETTER],
  S3: [PASSPORT_PHOTO, PREVIOUS_REPORT, TRANSFER_LETTER],
  L3: [NATIONAL_ID, PASSPORT_PHOTO, OLEVEL_RESULT_SLIP],
  L4: [NATIONAL_ID, PASSPORT_PHOTO, TVET_TRANSCRIPT],
  L5: [NATIONAL_ID, PASSPORT_PHOTO, TVET_TRANSCRIPT],
  STP: [NATIONAL_ID, PASSPORT_PHOTO],
};

export function getRequiredDocuments(level: string): RequiredDocument[] {
  return REQUIRED_DOCUMENTS_BY_LEVEL[level] ?? [];
}

export function getClassLevel(level: string): ClassLevelOption | undefined {
  return CLASS_LEVEL_OPTIONS.find((option) => option.value === level);
}
