export type TermType = "TERM_1" | "TERM_2" | "TERM_3";

export type ScopeType = "NURSERY" | "PRIMARY" | "LOWER SECONDARY" | "TVET";

export type AppliesToType =
  | "ALL_STUDENTS"
  | "DAY_ONLY"
  | "BOARDING_ONLY"
  | "NEW_STUDENTS_ONLY";

export interface FeeStructureItem {
  id: string;
  academicYear: string;
  term: TermType;
  scope: ScopeType;
  tradeName?: string | null; // Applicable only for TVET Scope
  name: string;
  amount: number;
  isMandatory: boolean;
  isBoardingOnly: boolean; // Applicable to Lower Secondary & TVET only
  isDayOnly: boolean; // Applicable to Lower Secondary & TVET only
  isNewStudentOnly: boolean; // Applicable to ALL levels
  customReason?: string; // Custom collector/bursar instructions
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  amountPaid: string | number;
  academicPeriod: string;
  remarks?: string | null;
  createdAt: string;
}
