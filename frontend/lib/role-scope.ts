import type { StaffRole } from "@/exports";

export type AcademicScope = "primary" | "secondary" | "tvet";

export type EducationCategory = "Nursery" | "Primary" | "Lower Secondary" | "TVET";

export interface ScopeConfig {
  scope: AcademicScope;
  /** Human readable department name used in page headers. */
  label: string;
  /** Short badge label. */
  shortLabel: string;
  /** Dashboard root of the module that owns this scope. */
  basePath: string;
  /** Student categories the module is allowed to see. */
  categories: EducationCategory[];
  /** Classes / levels managed by the module. */
  classes: string[];
  /** Streams / trades used when grouping classes. */
  streams: string[];
}

export const NURSERY_CLASSES = ["Nursery 1 (N1)", "Nursery 2 (N2)", "Nursery 3 (N3)"];

export const PRIMARY_CLASSES = [
  "Primary 1 (P1)",
  "Primary 2 (P2)",
  "Primary 3 (P3)",
  "Primary 4 (P4)",
  "Primary 5 (P5)",
  "Primary 6 (P6)",
];

export const SECONDARY_CLASSES = [
  "Senior 1 (S1)",
  "Senior 2 (S2)",
  "Senior 3 (S3)",
];

export const TVET_CLASSES = [
  "Level 3 (L3)",
  "Level 4 (L4)",
  "Level 5 (L5)",
  "Short-Term Training Program",
];

export const TVET_TRADES = [
  "Accounting",
  "Food Processing",
  "Mechanics",
  "Automobile Technology",
  "Agriculture",
  "Veterinary",
  "Not Available",
];

export const SCOPE_CONFIG: Record<AcademicScope, ScopeConfig> = {
  primary: {
    scope: "primary",
    label: "Nursery & Primary",
    shortLabel: "Primary",
    basePath: "/dashboard/headmaster-primary",
    categories: ["Nursery", "Primary"],
    classes: [...NURSERY_CLASSES, ...PRIMARY_CLASSES],
    streams: ["Stream A", "Stream B"],
  },
  secondary: {
    scope: "secondary",
    label: "Lower Secondary",
    shortLabel: "Secondary",
    basePath: "/dashboard/dos-secondary",
    categories: ["Lower Secondary"],
    classes: SECONDARY_CLASSES,
    streams: ["Stream A", "Stream B"],
  },
  tvet: {
    scope: "tvet",
    label: "TVET & Short-Term Training",
    shortLabel: "TVET",
    basePath: "/dashboard/dos-tvet",
    categories: ["TVET"],
    classes: TVET_CLASSES,
    streams: TVET_TRADES,
  },
};

/** Scopes whose reporting rolls up into the overall headmaster module. */
export const OVERALL_HEADMASTER_SCOPES: AcademicScope[] = ["secondary", "tvet"];

export const HEADMASTER_PRIMARY_BASE = SCOPE_CONFIG.primary.basePath;
export const HEADMASTER_SECONDARY_TVET_BASE = "/dashboard/headmaster-secondary-tvet";

export const ROLE_SCOPES: Partial<Record<StaffRole, AcademicScope[]>> = {
  HEADMASTER_PRIMARY: ["primary"],
  HEADMASTER_SECONDARY_TVET: ["secondary", "tvet"],
  DOS_SECONDARY: ["secondary"],
  DOS_TVET: ["tvet"],
};

export function getScopeConfig(scope: AcademicScope): ScopeConfig {
  return SCOPE_CONFIG[scope];
}

export function isCategoryInScope(scope: AcademicScope, category: EducationCategory): boolean {
  return SCOPE_CONFIG[scope].categories.includes(category);
}

/** True when a class label belongs to the given scope, independent of formatting. */
export function isClassInScope(scope: AcademicScope, className: string): boolean {
  const value = className.toLowerCase();
  switch (scope) {
    case "primary":
      return value.includes("nursery") || value.startsWith("n") || value.includes("primary") || /\bp[1-6]\b/.test(value);
    case "secondary":
      return value.includes("senior") || /\bs[1-3]\b/.test(value);
    case "tvet":
      return value.includes("level") || /\bl[3-5]\b/.test(value) || value.includes("short-term");
  }
}
