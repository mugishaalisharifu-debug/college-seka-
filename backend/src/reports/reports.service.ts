import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "src/db/db.provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, gte, lte, sql, desc, inArray } from "drizzle-orm";
import * as schema from "../db/schema"; 

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>
  ) {}

  // =========================================================================
  // 1. CASHIER / FOOD STORE REPORTS
  // =========================================================================

  /**
   * Generates food store stock reports for Cashiers/Storekeepers.
   * Aggregates transactions (STOCK_IN, STOCK_OUT, SPOILAGE) within a date range.
   */
  async getCashierStockReport(
    startDate?: string,
    endDate?: string,
    typeFilter?: "ALL" | "STOCK_IN" | "STOCK_OUT" | "SPOILAGE"
  ) {
    const conditions: any = [];

    if (startDate) {
      conditions.push(gte(schema.inventoryTransactions.createdAt, new Date(startDate)));
    }
    if (endDate) {
      // Set to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(schema.inventoryTransactions.createdAt, end));
    }
    if (typeFilter && typeFilter !== "ALL") {
      conditions.push(eq(schema.inventoryTransactions.type, typeFilter));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rawLogs = await this.db
      .select({
        id: schema.inventoryTransactions.id,
        date: schema.inventoryTransactions.createdAt,
        type: schema.inventoryTransactions.type,
        itemName: schema.inventoryItems.name,
        category: schema.inventoryItems.category,
        quantity: schema.inventoryTransactions.quantity,
        unit: schema.inventoryItems.unit,
        supplier: schema.inventoryTransactions.supplier,
        invoiceNumber: schema.inventoryTransactions.invoiceNumber,
        issuedTo: schema.inventoryTransactions.issuedTo,
        spoilageReason: schema.inventoryTransactions.spoilageReason,
        notes: schema.inventoryTransactions.notes,
        loggedBy: schema.users.name,
      })
      .from(schema.inventoryTransactions)
      .innerJoin(
        schema.inventoryItems,
        eq(schema.inventoryTransactions.itemId, schema.inventoryItems.id)
      )
      .innerJoin(
        schema.users,
        eq(schema.inventoryTransactions.recordedBy, schema.users.id)
      )
      .where(whereClause)
      .orderBy(desc(schema.inventoryTransactions.createdAt));

    // Map logs to format details string
    const logs = rawLogs.map((log) => {
      let details = "";
      if (log.type === "STOCK_IN") {
        details = log.supplier
          ? `${log.supplier}${log.invoiceNumber ? ` (INV: ${log.invoiceNumber})` : ""}`
          : "Delivery / Receipt";
      } else if (log.type === "STOCK_OUT") {
        details = log.issuedTo ? `Issued to ${log.issuedTo}` : "Kitchen / Kitchen usage";
      } else if (log.type === "SPOILAGE") {
        details = log.spoilageReason || log.notes || "Spoilage recorded";
      }

      return {
        id: log.id,
        date: log.date.toISOString().split("T")[0],
        type: log.type === "STOCK_IN" ? "IN" : log.type === "STOCK_OUT" ? "OUT" : "SPOILAGE",
        itemName: log.itemName,
        category: log.category,
        quantity: Number(log.quantity),
        unit: log.unit,
        details,
        loggedBy: log.loggedBy,
      };
    });

    // Calculate KPI summaries
    const totalInKg = logs
      .filter((l) => l.type === "IN")
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalOutKg = logs
      .filter((l) => l.type === "OUT")
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalSpoilageKg = logs
      .filter((l) => l.type === "SPOILAGE")
      .reduce((sum, item) => sum + item.quantity, 0);

    return {
      period: {
        startDate: startDate || "Beginning of Records",
        endDate: endDate || "Today",
      },
      summary: {
        totalInKg,
        totalOutKg,
        totalSpoilageKg,
        recordCount: logs.length,
      },
      logs,
    };
  }

  // =========================================================================
  // 2. BURSAR FINANCIAL REPORTS
  // =========================================================================

  /**
   * Generates Fee Collection Reports, Ledger Transactions, and Summary Rates.
   */
  async getBursarFinancialReport(academicPeriod: string, scopeFilter?: string) {
    // 1. Get Fee Structure expected amounts per level
    const fees = await this.db
      .select({
        scope: schema.feeStructures.scope,
        amount: schema.feeStructures.amount,
      })
      .from(schema.feeStructures)
      .where(eq(schema.feeStructures.isMandatory, true));

    // Calculate sum of mandatory fees per level
    const feePerScope: Record<string, number> = {};
    for (const f of fees) {
      feePerScope[f.scope] = (feePerScope[f.scope] || 0) + Number(f.amount);
    }

    // 2. Count Active Students per Level
    const studentCounts = await this.db
      .select({
        scope: schema.students.educationLevel,
        count: sql<number>`count(${schema.students.id})::int`,
      })
      .from(schema.students)
      .where(eq(schema.students.status, "ACTIVE"))
      .groupBy(schema.students.educationLevel);

    // 3. Sum Payments collected per level for the given academic period
    const paymentsPerScope = await this.db
      .select({
        scope: schema.students.educationLevel,
        totalPaid: sql<number>`COALESCE(sum(${schema.payments.amountPaid}), 0)::float`,
      })
      .from(schema.payments)
      .innerJoin(
        schema.students,
        eq(schema.payments.studentId, schema.students.id)
      )
      .where(eq(schema.payments.academicPeriod, academicPeriod))
      .groupBy(schema.students.educationLevel);

    const paidMap = new Map<string, number>();
    paymentsPerScope.forEach((p) => paidMap.set(p.scope, p.totalPaid));

    // 4. Construct Fee Collection Summary Rows
    const scopesToProcess = scopeFilter && scopeFilter !== "All"
      ? [scopeFilter]
      : ["PRIMARY", "LOWER SECONDARY", "TVET", "NURSERY"];

    const summary = scopesToProcess.map((scope) => {
      const count = studentCounts.find((sc) => sc.scope === scope)?.count || 0;
      const feePerStudent = feePerScope[scope] || 0;
      const totalCharged = count * feePerStudent;
      const totalPaid = paidMap.get(scope) || 0;
      const outstanding = Math.max(0, totalCharged - totalPaid);

      return {
        category: scope,
        students: count,
        totalCharged,
        totalPaid,
        outstanding,
        collectionRate: totalCharged > 0 ? Math.round((totalPaid / totalCharged) * 100) : 0,
      };
    });

    // 5. Fetch Ledger Transactions
    const txConditions = [eq(schema.payments.academicPeriod, academicPeriod)];
    if (scopeFilter && scopeFilter !== "All") {
      txConditions.push(eq(schema.students.educationLevel, scopeFilter as any));
    }

    const rawTransactions = await this.db
      .select({
        id: schema.payments.id,
        receiptNo: schema.payments.receiptNo,
        studentName: schema.students.studentName,
        category: schema.students.educationLevel,
        amount: schema.payments.amountPaid,
        date: schema.payments.createdAt,
        period: schema.payments.academicPeriod,
        remarks: schema.payments.remarks,
      })
      .from(schema.payments)
      .innerJoin(schema.students, eq(schema.payments.studentId, schema.students.id))
      .where(and(...txConditions))
      .orderBy(desc(schema.payments.createdAt));

    const transactions = rawTransactions.map((tx) => ({
      id: tx.id,
      receiptNo: tx.receiptNo,
      studentName: tx.studentName,
      category: tx.category,
      amount: Number(tx.amount),
      method: tx.remarks || "Bank Transfer / Cash",
      date: tx.date.toISOString().split("T")[0],
      period: tx.period,
    }));

    return {
      academicPeriod,
      summary,
      transactions,
    };
  }

  // =========================================================================
  // 3. STORE MANAGER / INVENTORY REPORTS
  // =========================================================================

  /**
   * Store Usage and Balance Report.
   */
  async getStoreManagerUsageReport() {
    const items = await this.db
      .select({
        id: schema.storeItems.id,
        name: schema.storeItems.name,
        category: schema.storeItems.category,
        unit: schema.storeItems.unit,
        availableQuantity: schema.storeItems.availableQuantity,
      })
      .from(schema.storeItems);

    const rows = await Promise.all(
      items.map(async (item) => {
        // Calculate total deposited
        const dep = await this.db
          .select({
            total: sql<number>`COALESCE(sum(${schema.studentStoreDeposits.quantityBrought}), 0)::float`,
          })
          .from(schema.studentStoreDeposits)
          .where(eq(schema.studentStoreDeposits.storeItemId, item.id));

        // Calculate total issued out
        const iss = await this.db
          .select({
            total: sql<number>`COALESCE(sum(${schema.storeTransactions.quantity}), 0)::float`,
          })
          .from(schema.storeTransactions)
          .where(
            and(
              eq(schema.storeTransactions.storeItemId, item.id),
              eq(schema.storeTransactions.type, "ISSUED_OUT")
            )
          );

        const totalReceived = dep[0]?.total || 0;
        const totalIssued = iss[0]?.total || 0;
        const balance = Number(item.availableQuantity);
        const status = balance < 10 ? "Low Stock Alert" : "In Stock";

        return [
          item.name,
          `${totalReceived} ${item.unit}`,
          `${totalIssued} ${item.unit}`,
          `${balance} ${item.unit}`,
          status,
        ];
      })
    );

    return {
      id: "RPT-001",
      title: "Consolidated Store Usage & Balance Report",
      academicYear: "2026/2027",
      generatedDate: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }),
      generatedBy: "Store Manager Office",
      summary:
        "Full summary of items collected from incoming students and issued out to school departments. Tracks current stock balances to ensure zero waste.",
      headers: ["Item Description", "Total Received", "Stock Issued", "Current Balance", "Status"],
      rows,
    };
  }

  /**
   * Audit of Student Requirement Collections.
   */
  async getStudentRequirementAuditReport(academicYear: string) {
    const levels = ["NURSERY", "PRIMARY", "LOWER SECONDARY", "TVET"] as const;

    const rows = await Promise.all(
      levels.map(async (level) => {
        // Total active students in level
        const countRes = await this.db
          .select({ count: sql<number>`count(${schema.students.id})::int` })
          .from(schema.students)
          .where(
            and(
              eq(schema.students.educationLevel, level),
              eq(schema.students.status, "ACTIVE")
            )
          );
        const studentCount = countRes[0]?.count || 0;

        // Total checks expected vs completed
        const checks = await this.db
          .select({
            isBrought: schema.studentRequirementChecks.isBrought,
          })
          .from(schema.studentRequirementChecks)
          .innerJoin(
            schema.students,
            eq(schema.studentRequirementChecks.studentId, schema.students.id)
          )
          .where(eq(schema.students.educationLevel, level));

        const totalBrought = checks.filter((c) => c.isBrought).length;
        const totalMissing = checks.filter((c) => !c.isBrought).length;
        const totalChecks = checks.length;
        const fulfillmentRate =
          totalChecks > 0 ? ((totalBrought / totalChecks) * 100).toFixed(1) + "%" : "100%";

        return [
          level === "NURSERY"
            ? "KG / Nursery"
            : level === "PRIMARY"
            ? "Primary (P1-P6)"
            : level === "LOWER SECONDARY"
            ? "Lower Secondary (S1-S3)"
            : "TVET Trades (L3-L5)",
          `${studentCount} Students`,
          `${totalBrought} Items Submitted`,
          `${totalMissing} Items Missing`,
          fulfillmentRate,
        ];
      })
    );

    return {
      id: "RPT-002",
      title: "Student Requirement Collection Audit",
      academicYear,
      generatedDate: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }),
      generatedBy: "Store Manager Office",
      summary:
        "Audit of items brought by newly admitted students across KG, Primary, Secondary, and TVET levels.",
      headers: ["Education Level", "Students Enrolled", "Items Brought", "Missing Items", "Fulfillment Rate"],
      rows,
    };
  }

  // =========================================================================
  // 4. OPERATIONAL / ACADEMIC HEADMASTER REPORTS
  // =========================================================================

  /**
   * Primary/Nursery or Secondary Operational Summary Report.
   */
  async getOperationalReport(
    scope: "PRIMARY" | "NURSERY" | "LOWER SECONDARY" | "TVET",
    academicYear: string,
    term: string
  ) {
    const studentCountRes = await this.db
      .select({ count: sql<number>`count(${schema.students.id})::int` })
      .from(schema.students)
      .where(
        and(
          eq(schema.students.educationLevel, scope),
          eq(schema.students.status, "ACTIVE")
        )
      );

    const applicationsRes = await this.db
      .select({
        status: schema.applications.status,
        count: sql<number>`count(${schema.applications.id})::int`,
      })
      .from(schema.applications)
      .where(eq(schema.applications.educationLevel, scope))
      .groupBy(schema.applications.status);

    return {
      scope,
      academicYear,
      term,
      activeStudents: studentCountRes[0]?.count || 0,
      applicationsSummary: applicationsRes.reduce(
        (acc, curr) => ({ ...acc, [curr.status]: curr.count }),
        { PENDING: 0, APPROVED: 0, REJECTED: 0 }
      ),
    };
  }
}