import api from "./api";
import { getApiErrorMessage } from "./api-helpers";
import type { ContactMessage } from "./contact-messages-storage";
import type { NewsArticle, GalleryItem, DownloadItem } from "@/exports";
import type { FeeStructureItem, PaymentRecord } from "./fees-types";

export type { ContactMessage, NewsArticle, GalleryItem, DownloadItem, FeeStructureItem, PaymentRecord };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  email?: string;
  phone?: string;
  address?: string;
  classId?: string;
  className?: string;
  status: "Active" | "Inactive" | "Graduated" | "Transferred";
  enrollmentDate?: string;
}

export interface StudentCreateInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  email?: string;
  phone?: string;
  address?: string;
  classId?: string;
  status?: "Active" | "Inactive" | "Graduated" | "Transferred";
  enrollmentDate?: string;
}

export interface StudentUpdateInput extends Partial<StudentCreateInput> {
  id: string;
}

export interface Class {
  id: string;
  name: string;
  level: "Nursery" | "Primary" | "Lower Secondary" | "TVET";
  section?: string;
  stream?: string;
  tradeName?: string;
  academicYear: string;
  capacity?: number;
  classTeacherId?: string;
  classTeacherName?: string;
}

export interface ClassCreateInput {
  name: string;
  level: "Nursery" | "Primary" | "Lower Secondary" | "TVET";
  section?: string;
  stream?: string;
  tradeName?: string;
  academicYear: string;
  capacity?: number;
  classTeacherId?: string;
}

export interface ClassUpdateInput extends Partial<ClassCreateInput> {
  id: string;
}

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  email?: string;
  phone?: string;
  address?: string;
  applyingFor: string;
  previousSchool?: string;
  status: "Pending" | "Under Review" | "Accepted" | "Rejected" | "Waitlisted";
  documents?: string[];
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  remarks?: string;
}

export interface ApplicationCreateInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  email?: string;
  phone?: string;
  address?: string;
  applyingFor: string;
  previousSchool?: string;
  documents?: string[];
  remarks?: string;
}

export interface ApplicationUpdateStatusInput {
  id: string;
  status: "Pending" | "Under Review" | "Accepted" | "Rejected" | "Waitlisted";
  remarks?: string;
}

export interface RequirementMasterItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface CheckinDirectoryItem {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  status: "Complete" | "Incomplete" | "Pending";
  checkedAt: string;
  checkedBy: string;
}

export interface ClearanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  items: {
    requirement: string;
    status: "Cleared" | "Pending" | "Not Submitted";
  }[];
  savedAt: string;
}

export interface StoreInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  location: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku?: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  location: string;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemCreateInput {
  name: string;
  category: string;
  sku?: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  location: string;
  minStockLevel: number;
}

export interface InventoryItemUpdateInput extends Partial<InventoryItemCreateInput> {
  id: string;
}

export type StockTransactionType = "STOCK_IN" | "STOCK_OUT" | "SPOILAGE";

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: StockTransactionType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

export interface StockInInput {
  itemId: string;
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
}

export interface StockOutInput {
  itemId: string;
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface SpoilageInput {
  itemId: string;
  quantity: number;
  reason: string;
  reference?: string;
}

export interface FeeStructure {
  id: string;
  academicYear: string;
  term: "TERM_1" | "TERM_2" | "TERM_3";
  scope: "NURSERY" | "PRIMARY" | "LOWER SECONDARY" | "TVET";
  tradeName?: string;
  name: string;
  amount: number;
  isMandatory: boolean;
  isBoardingOnly: boolean;
  isDayOnly: boolean;
  isNewStudentOnly: boolean;
  customReason?: string;
}

export interface FeeStructureCreateInput {
  academicYear: string;
  term: "TERM_1" | "TERM_2" | "TERM_3";
  scope: "NURSERY" | "PRIMARY" | "LOWER SECONDARY" | "TVET";
  tradeName?: string;
  name: string;
  amount: number;
  isMandatory: boolean;
  isBoardingOnly: boolean;
  isDayOnly: boolean;
  isNewStudentOnly: boolean;
  customReason?: string;
}

export interface FeeStructureUpdateInput extends Partial<FeeStructureCreateInput> {
  id: string;
}

export interface StudentLedgerEntry {
  id: string;
  studentId: string;
  studentName: string;
  academicYear: string;
  term: "TERM_1" | "TERM_2" | "TERM_3";
  feeItems: {
    id: string;
    name: string;
    amount: number;
    paid: number;
    balance: number;
  }[];
  totalDue: number;
  totalPaid: number;
  balance: number;
}

export interface DebtorRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  lastPaymentDate?: string;
}

export interface PaymentCreateInput {
  studentId: string;
  receiptNo: string;
  amountPaid: number;
  academicPeriod: string;
  remarks?: string;
}

export interface PaymentUpdateInput extends Partial<PaymentCreateInput> {
  id: string;
}

export interface StoreStock {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  location: string;
  minStockLevel: number;
  updatedAt: string;
}

export interface StoreStockInput {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  location: string;
  minStockLevel: number;
}

export interface UsageLog {
  id: string;
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
  usedBy: string;
  purpose: string;
  usedAt: string;
}

export interface UsageLogCreateInput {
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
  usedBy: string;
  purpose: string;
}

export interface CashierStockReport {
  generatedAt: string;
  cashierName: string;
  transactions: StockTransaction[];
  summary: {
    totalStockIn: number;
    totalStockOut: number;
    totalSpoilage: number;
  };
}

export interface BursarFinancialReport {
  generatedAt: string;
  bursarName: string;
  academicYear: string;
  totalFeesDue: number;
  totalFeesCollected: number;
  totalOutstanding: number;
  paymentTrend: {
    period: string;
    collected: number;
  }[];
}

export interface StoreManagerUsageReport {
  generatedAt: string;
  storeManagerName: string;
  items: {
    itemName: string;
    totalIssued: number;
    totalReturned: number;
  }[];
}

export interface OperationalReport {
  generatedAt: string;
  reportType: "Operational Summary";
  students: {
    total: number;
    active: number;
    newThisTerm: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  finance: {
    totalCollected: number;
    totalOutstanding: number;
  };
}

async function handleResponse<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw new Error(message);
  }
}

async function handleVoidResponse(promise: Promise<{ data?: unknown }>): Promise<void> {
  try {
    await promise;
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw new Error(message);
  }
}

export const auth = {
  login: (payload: LoginRequest) =>
    handleResponse<LoginResponse>(api.post("/auth/login", payload)),

  getProfile: () =>
    handleResponse<ProfileResponse>(api.get("/auth/profile")),

  getStaff: () =>
    handleResponse<StaffMember[]>(api.get("/auth/staff-accounts")),

  resetPassword: (payload: { userId: string; newPassword: string }) =>
    handleVoidResponse(api.post("/auth/admin-reset-password", payload)),

  updateEmail: (payload: { userId: string; email: string }) =>
    handleResponse<ProfileResponse>(api.patch("/auth/admin-update-email", payload)),
};

export const students = {
  getAll: () =>
    handleResponse<Student[]>(api.get("/dos/students")),

  create: (payload: StudentCreateInput) =>
    handleResponse<Student>(api.post("/dos/students", payload)),

  update: (id: string, payload: Partial<StudentCreateInput>) =>
    handleResponse<Student>(api.patch(`/dos/students/${id}`, payload)),

  delete: (id: string) =>
    handleVoidResponse(api.delete(`/dos/students/${id}`)),
};

export const classes = {
  getAll: () =>
    handleResponse<Class[]>(api.get("/dos/classes")),

  create: (payload: ClassCreateInput) =>
    handleResponse<Class>(api.post("/dos/classes", payload)),

  update: (id: string, payload: Partial<ClassCreateInput>) =>
    handleResponse<Class>(api.patch(`/dos/classes/${id}`, payload)),

  delete: (id: string) =>
    handleVoidResponse(api.delete(`/dos/classes/${id}`)),
};

export const applications = {
  getAll: () =>
    handleResponse<Application[]>(api.get("/applications")),

  getById: (id: string) =>
    handleResponse<Application>(api.get(`/applications/${id}`)),

  create: (payload: ApplicationCreateInput | FormData) =>
    handleResponse<Application>(api.post("/applications", payload)),

  lookupPublic: (referenceCode: string, phone: string) =>
    handleResponse<{
      applicantName: string;
      applicationCode: string;
      educationLevel: string;
      status: "Admitted" | "Pending" | "Rejected";
      assignedClass?: string;
      note?: string;
    } | null>(api.get("/applications/public/status", { params: { referenceCode, phone } })),

  listAdmittedPublic: () =>
    handleResponse<{ id: number; name: string; level: string; assignedClass: string }[]>(
      api.get("/applications/public/admitted"),
    ),

  updateStatus: (id: string, payload: { status: "APPROVED" | "REJECTED" }) =>
    handleResponse<Application>(api.patch(`/applications/${id}/status`, payload)),

  delete: (id: string) =>
    handleVoidResponse(api.delete(`/applications/${id}`)),
};

export const requirements = {
  getMasterItems: () =>
    handleResponse<RequirementMasterItem[]>(api.get("/requirements/master")),

  createMasterItem: (payload: Partial<RequirementMasterItem>) =>
    handleResponse<RequirementMasterItem>(api.post("/requirements/master", payload)),

  deleteMasterItem: (id: string) =>
    handleVoidResponse(api.delete(`/requirements/master/${id}`)),

  getCheckinDirectory: () =>
    handleResponse<CheckinDirectoryItem[]>(api.get("/requirements/checkin-directory")),

  saveClearance: (studentId: string, payload: Partial<ClearanceRecord> & Record<string, unknown>) =>
    handleResponse<ClearanceRecord>(api.post(`/requirements/clearance/${studentId}`, payload)),

  getStoreInventory: () =>
    handleResponse<StoreInventoryItem[]>(api.get("/requirements/store-inventory")),

  issueStoreItem: (payload: { storeItemId: string; issuedTo: string; quantity: number; notes?: string }) =>
    handleResponse<unknown>(api.post("/requirements/store-inventory/issue", payload)),
};

export const inventory = {
  getItems: () =>
    handleResponse<InventoryItem[]>(api.get("/inventory/items")),

  createItem: (payload: InventoryItemCreateInput) =>
    handleResponse<InventoryItem>(api.post("/inventory/items", payload)),

  updateItem: (id: string, payload: Partial<InventoryItemCreateInput>) =>
    handleResponse<InventoryItem>(api.patch(`/inventory/items/${id}`, payload)),

  deleteItem: (id: string) =>
    handleVoidResponse(api.delete(`/inventory/items/${id}`)),

  getTransactions: () =>
    handleResponse<StockTransaction[]>(api.get("/inventory/history")),

  createStockIn: (payload: StockInInput) =>
    handleResponse<StockTransaction>(api.post("/inventory/stock-in", payload)),

  createStockOut: (payload: StockOutInput) =>
    handleResponse<StockTransaction>(api.post("/inventory/stock-out", payload)),

  createSpoilage: (payload: SpoilageInput) =>
    handleResponse<StockTransaction>(api.post("/inventory/spoilage", payload)),

  updateTransaction: (id: string, payload: Partial<StockTransaction>) =>
    handleResponse<StockTransaction>(api.patch(`/inventory/transactions/${id}`, payload)),

  deleteTransaction: (id: string) =>
    handleVoidResponse(api.delete(`/inventory/transactions/${id}`)),
};

export const finance = {
  getFeeStructures: () =>
    handleResponse<FeeStructureItem[]>(api.get("/finance/fee-structures")),

  createFeeStructure: (payload: FeeStructureCreateInput) =>
    handleResponse<FeeStructure>(api.post("/finance/fee-structures", payload)),

  updateFeeStructure: (id: string, payload: Partial<FeeStructureCreateInput>) =>
    handleResponse<FeeStructure>(api.patch(`/finance/fee-structures/${id}`, payload)),

  deleteFeeStructure: (id: string) =>
    handleVoidResponse(api.delete(`/finance/fee-structures/${id}`)),

  getStudentLedger: (studentId: string) =>
    handleResponse<StudentLedgerEntry>(api.get(`/finance/ledger/${studentId}`)),

  getDebtors: () =>
    handleResponse<DebtorRecord[]>(api.get("/finance/debtors")),

  getPayments: () =>
    handleResponse<PaymentRecord[]>(api.get("/finance/payments")),

  createPayment: (payload: PaymentCreateInput) =>
    handleResponse<PaymentRecord>(api.post("/finance/payments", payload)),

  updatePayment: (id: string, payload: Partial<PaymentCreateInput>) =>
    handleResponse<PaymentRecord>(api.patch(`/finance/payments/${id}`, payload)),

  deletePayment: (id: string) =>
    handleVoidResponse(api.delete(`/finance/payments/${id}`)),
};

export const storeManager = {
  getStock: () =>
    handleResponse<StoreStock[]>(api.get("/store-manager/stock")),

  createOrUpdateStock: (payload: StoreStockInput) =>
    handleResponse<StoreStock>(api.post("/store-manager/stock", payload)),

  deleteStock: (id: string) =>
    handleVoidResponse(api.delete(`/store-manager/stock/${id}`)),

  getUsageLogs: () =>
    handleResponse<UsageLog[]>(api.get("/store-manager/usage-logs")),

  createUsageLog: (payload: UsageLogCreateInput) =>
    handleResponse<UsageLog>(api.post("/store-manager/usage-logs", payload)),

  deleteUsageLog: (id: string) =>
    handleVoidResponse(api.delete(`/store-manager/usage-logs/${id}`)),
};

export const admin = {
  news: {
    getAll: () =>
      handleResponse<NewsArticle[]>(api.get("/admin/news")),

    getPublic: () =>
      handleResponse<NewsArticle[]>(api.get("/admin/public/news")),

    create: (payload: Partial<NewsArticle>) =>
      handleResponse<NewsArticle>(api.post("/admin/news", payload)),

    update: (id: string, payload: Partial<NewsArticle>) =>
      handleResponse<NewsArticle>(api.put(`/admin/news/${id}`, payload)),

    toggleStatus: (id: string) =>
      handleResponse<NewsArticle>(api.patch(`/admin/news/${id}/toggle-status`)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/admin/news/${id}`)),
  },

  gallery: {
    getAll: () =>
      handleResponse<GalleryItem[]>(api.get("/admin/gallery")),

    getPublic: () =>
      handleResponse<GalleryItem[]>(api.get("/admin/public/gallery")),

    create: (payload: Partial<GalleryItem> | FormData) =>
      handleResponse<GalleryItem>(api.post("/admin/gallery", payload)),

    togglePublish: (id: string) =>
      handleResponse<GalleryItem>(api.patch(`/admin/gallery/${id}/toggle-publish`)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/admin/gallery/${id}`)),
  },

  downloads: {
    getAll: () =>
      handleResponse<DownloadItem[]>(api.get("/admin/downloads")),

    getPublic: () =>
      handleResponse<DownloadItem[]>(api.get("/admin/public/downloads")),

    create: (payload: Partial<DownloadItem> | FormData) =>
      handleResponse<DownloadItem>(api.post("/admin/downloads", payload)),

    update: (id: string, payload: Partial<DownloadItem>) =>
      handleResponse<DownloadItem>(api.patch(`/admin/downloads/${id}`, payload)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/admin/downloads/${id}`)),
  },

  contactMessages: {
    getAll: () =>
      handleResponse<ContactMessage[]>(api.get("/admin/contact-messages")),

    getById: (id: string) =>
      handleResponse<ContactMessage>(api.get(`/admin/contact-messages/${id}`)),

    reply: (id: string, payload: { reply: string }) =>
      handleResponse<ContactMessage>(api.post(`/admin/contact-messages/${id}/reply`, payload)),

    updateStatus: (id: string, payload: { status: ContactMessage["status"] }) =>
      handleResponse<ContactMessage>(api.patch(`/admin/contact-messages/${id}/status`, payload)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/admin/contact-messages/${id}`)),
  },
};

export const reports = {
  getCashierStockReport: () =>
    handleResponse<CashierStockReport>(api.get("/reports/cashier/stock")),

  getBursarFinancialReport: (params?: { period?: string; scope?: string }) =>
    handleResponse<BursarFinancialReport>(api.get("/reports/bursar/financial", { params })),

  getStoreManagerUsageReport: () =>
    handleResponse<StoreManagerUsageReport>(api.get("/reports/store-manager/usage")),

  getOperationalReport: (params?: { scope?: string; academicYear?: string; term?: string }) =>
    handleResponse<OperationalReport>(api.get("/reports/operational", { params })),
};
