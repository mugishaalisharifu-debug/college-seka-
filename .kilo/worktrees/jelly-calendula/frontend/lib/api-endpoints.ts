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
    handleResponse<LoginResponse>(api.post("/api/auth/login", payload)),

  getProfile: () =>
    handleResponse<ProfileResponse>(api.get("/api/auth/profile")),

  getStaff: () =>
    handleResponse<StaffMember[]>(api.get("/api/auth/staff")),

  resetPassword: (payload: { email: string }) =>
    handleVoidResponse(api.post("/api/auth/reset-password", payload)),

  updateEmail: (payload: { email: string }) =>
    handleResponse<ProfileResponse>(api.put("/api/auth/update-email", payload)),
};

export const students = {
  getAll: () =>
    handleResponse<Student[]>(api.get("/api/students")),

  getById: (id: string) =>
    handleResponse<Student>(api.get(`/api/students/${id}`)),

  create: (payload: StudentCreateInput) =>
    handleResponse<Student>(api.post("/api/students", payload)),

  update: (id: string, payload: Partial<StudentCreateInput>) =>
    handleResponse<Student>(api.put(`/api/students/${id}`, payload)),

  delete: (id: string) =>
    handleVoidResponse(api.delete(`/api/students/${id}`)),
};

export const classes = {
  getAll: () =>
    handleResponse<Class[]>(api.get("/api/classes")),

  getById: (id: string) =>
    handleResponse<Class>(api.get(`/api/classes/${id}`)),

  create: (payload: ClassCreateInput) =>
    handleResponse<Class>(api.post("/api/classes", payload)),

  update: (id: string, payload: Partial<ClassCreateInput>) =>
    handleResponse<Class>(api.put(`/api/classes/${id}`, payload)),

  delete: (id: string) =>
    handleVoidResponse(api.delete(`/api/classes/${id}`)),
};

export const applications = {
  getAll: () =>
    handleResponse<Application[]>(api.get("/api/applications")),

  getById: (id: string) =>
    handleResponse<Application>(api.get(`/api/applications/${id}`)),

  create: (payload: ApplicationCreateInput) =>
    handleResponse<Application>(api.post("/api/applications", payload)),

  updateStatus: (id: string, payload: ApplicationUpdateStatusInput) =>
    handleResponse<Application>(api.put(`/api/applications/${id}/status`, payload)),

  delete: (id: string) =>
    handleVoidResponse(api.delete(`/api/applications/${id}`)),
};

export const requirements = {
  getMasterItems: () =>
    handleResponse<RequirementMasterItem[]>(api.get("/api/requirements/master-items")),

  createMasterItem: (payload: Partial<RequirementMasterItem>) =>
    handleResponse<RequirementMasterItem>(api.post("/api/requirements/master-items", payload)),

  deleteMasterItem: (id: string) =>
    handleVoidResponse(api.delete(`/api/requirements/master-items/${id}`)),

  getCheckinDirectory: () =>
    handleResponse<CheckinDirectoryItem[]>(api.get("/api/requirements/checkin-directory")),

  saveClearance: (payload: Partial<ClearanceRecord>) =>
    handleResponse<ClearanceRecord>(api.post("/api/requirements/clearance", payload)),

  getStoreInventory: () =>
    handleResponse<StoreInventoryItem[]>(api.get("/api/requirements/store-inventory")),

  issueStoreItem: (payload: { itemId: string; studentId: string; quantity: number }) =>
    handleResponse<unknown>(api.post("/api/requirements/issue-store-item", payload)),
};

export const inventory = {
  getItems: () =>
    handleResponse<InventoryItem[]>(api.get("/api/inventory/items")),

  createItem: (payload: InventoryItemCreateInput) =>
    handleResponse<InventoryItem>(api.post("/api/inventory/items", payload)),

  updateItem: (id: string, payload: Partial<InventoryItemCreateInput>) =>
    handleResponse<InventoryItem>(api.put(`/api/inventory/items/${id}`, payload)),

  deleteItem: (id: string) =>
    handleVoidResponse(api.delete(`/api/inventory/items/${id}`)),

  getTransactions: () =>
    handleResponse<StockTransaction[]>(api.get("/api/inventory/transactions")),

  createStockIn: (payload: StockInInput) =>
    handleResponse<StockTransaction>(api.post("/api/inventory/stock-in", payload)),

  createStockOut: (payload: StockOutInput) =>
    handleResponse<StockTransaction>(api.post("/api/inventory/stock-out", payload)),

  createSpoilage: (payload: SpoilageInput) =>
    handleResponse<StockTransaction>(api.post("/api/inventory/spoilage", payload)),

  updateTransaction: (id: string, payload: Partial<StockTransaction>) =>
    handleResponse<StockTransaction>(api.put(`/api/inventory/transactions/${id}`, payload)),

  deleteTransaction: (id: string) =>
    handleVoidResponse(api.delete(`/api/inventory/transactions/${id}`)),
};

export const finance = {
  getFeeStructures: () =>
    handleResponse<FeeStructureItem[]>(api.get("/api/finance/fee-structures")),

  createFeeStructure: (payload: FeeStructureCreateInput) =>
    handleResponse<FeeStructure>(api.post("/api/finance/fee-structures", payload)),

  updateFeeStructure: (id: string, payload: Partial<FeeStructureCreateInput>) =>
    handleResponse<FeeStructure>(api.put(`/api/finance/fee-structures/${id}`, payload)),

  deleteFeeStructure: (id: string) =>
    handleVoidResponse(api.delete(`/api/finance/fee-structures/${id}`)),

  getStudentLedger: (studentId: string) =>
    handleResponse<StudentLedgerEntry>(api.get(`/api/finance/ledger/${studentId}`)),

  getDebtors: () =>
    handleResponse<DebtorRecord[]>(api.get("/api/finance/debtors")),

  getPayments: () =>
    handleResponse<PaymentRecord[]>(api.get("/api/finance/payments")),

  createPayment: (payload: PaymentCreateInput) =>
    handleResponse<PaymentRecord>(api.post("/api/finance/payments", payload)),

  updatePayment: (id: string, payload: Partial<PaymentCreateInput>) =>
    handleResponse<PaymentRecord>(api.put(`/api/finance/payments/${id}`, payload)),

  deletePayment: (id: string) =>
    handleVoidResponse(api.delete(`/api/finance/payments/${id}`)),
};

export const storeManager = {
  getStock: () =>
    handleResponse<StoreStock[]>(api.get("/api/store-manager/stock")),

  createOrUpdateStock: (payload: StoreStockInput) =>
    handleResponse<StoreStock>(api.post("/api/store-manager/stock", payload)),

  deleteStock: (id: string) =>
    handleVoidResponse(api.delete(`/api/store-manager/stock/${id}`)),

  getUsageLogs: () =>
    handleResponse<UsageLog[]>(api.get("/api/store-manager/usage-logs")),

  createUsageLog: (payload: UsageLogCreateInput) =>
    handleResponse<UsageLog>(api.post("/api/store-manager/usage-logs", payload)),

  deleteUsageLog: (id: string) =>
    handleVoidResponse(api.delete(`/api/store-manager/usage-logs/${id}`)),
};

export const admin = {
  news: {
    getAll: () =>
      handleResponse<NewsArticle[]>(api.get("/api/admin/news")),

    getPublic: () =>
      handleResponse<NewsArticle[]>(api.get("/api/news")),

    create: (payload: Partial<NewsArticle>) =>
      handleResponse<NewsArticle>(api.post("/api/admin/news", payload)),

    update: (id: string, payload: Partial<NewsArticle>) =>
      handleResponse<NewsArticle>(api.put(`/api/admin/news/${id}`, payload)),

    toggleStatus: (id: string) =>
      handleResponse<NewsArticle>(api.put(`/api/admin/news/${id}/toggle`)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/api/admin/news/${id}`)),
  },

  gallery: {
    getAll: () =>
      handleResponse<GalleryItem[]>(api.get("/api/admin/gallery")),

    getPublic: () =>
      handleResponse<GalleryItem[]>(api.get("/api/gallery")),

    create: (payload: Partial<GalleryItem>) =>
      handleResponse<GalleryItem>(api.post("/api/admin/gallery", payload)),

    togglePublish: (id: string) =>
      handleResponse<GalleryItem>(api.put(`/api/admin/gallery/${id}/toggle`)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/api/admin/gallery/${id}`)),
  },

  downloads: {
    getAll: () =>
      handleResponse<DownloadItem[]>(api.get("/api/admin/downloads")),

    getPublic: () =>
      handleResponse<DownloadItem[]>(api.get("/api/downloads")),

    create: (payload: Partial<DownloadItem>) =>
      handleResponse<DownloadItem>(api.post("/api/admin/downloads", payload)),

    update: (id: string, payload: Partial<DownloadItem>) =>
      handleResponse<DownloadItem>(api.put(`/api/admin/downloads/${id}`, payload)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/api/admin/downloads/${id}`)),
  },

  contactMessages: {
    getAll: () =>
      handleResponse<ContactMessage[]>(api.get("/api/admin/contact-messages")),

    getById: (id: string) =>
      handleResponse<ContactMessage>(api.get(`/api/admin/contact-messages/${id}`)),

    reply: (id: string, payload: { reply: string }) =>
      handleResponse<ContactMessage>(api.post(`/api/admin/contact-messages/${id}/reply`, payload)),

    updateStatus: (id: string, payload: { status: ContactMessage["status"] }) =>
      handleResponse<ContactMessage>(api.put(`/api/admin/contact-messages/${id}/status`, payload)),

    delete: (id: string) =>
      handleVoidResponse(api.delete(`/api/admin/contact-messages/${id}`)),
  },
};

export const reports = {
  getCashierStockReport: () =>
    handleResponse<CashierStockReport>(api.get("/api/reports/cashier-stock")),

  getBursarFinancialReport: (params?: { academicYear?: string; term?: string }) =>
    handleResponse<BursarFinancialReport>(api.get("/api/reports/bursar-financial", { params })),

  getStoreManagerUsageReport: () =>
    handleResponse<StoreManagerUsageReport>(api.get("/api/reports/store-manager-usage")),

  getOperationalReport: () =>
    handleResponse<OperationalReport>(api.get("/api/reports/operational")),
};