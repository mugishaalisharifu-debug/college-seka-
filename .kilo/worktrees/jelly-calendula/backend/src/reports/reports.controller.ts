import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtGuard } from "common/guards/auth.guard";
import { RoleGuard } from "common/guards/role.guard";
import { Roles } from "common/decorators/role.decorator";

@Controller("reports")
@UseGuards(JwtGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // =========================================================================
  // CASHIER / STOREKEEPER FOOD REPORTS
  // =========================================================================
  @Get("cashier/stock")
  @Roles('Cashier', 'Secondary-HeadMaster', 'Primary-HeadMaster')
  async getCashierStockReport(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("type") type?: "ALL" | "STOCK_IN" | "STOCK_OUT" | "SPOILAGE"
  ) {
    return this.reportsService.getCashierStockReport(startDate, endDate, type);
  }

  // =========================================================================
  // BURSAR FINANCIAL REPORTS
  // =========================================================================
  @Get("bursar/financial")
  // @Roles('Bursar', 'Admin', 'Secondary-HeadMaster', 'Primary-HeadMaster')
  async getBursarFinancialReport(
    @Query("period") period: string = "2026 - Term 1",
    @Query("scope") scope?: string
  ) {
    return this.reportsService.getBursarFinancialReport(period, scope);
  }

  // =========================================================================
  // STORE MANAGER INVENTORY REPORTS
  // =========================================================================
  @Get("store-manager/usage")
  @Roles('Store-Mnager', 'Admin', 'Secondary-HeadMaster', 'Primary-HeadMaster')
  async getStoreManagerUsageReport() {
    return this.reportsService.getStoreManagerUsageReport();
  }

  @Get("store-manager/requirement-audit")
  @Roles('Store-Mnager', 'Secondary-HeadMaster', 'Primary-HeadMaster')
  async getStudentRequirementAuditReport(
    @Query("academicYear") academicYear: string = "2026/2027"
  ) {
    return this.reportsService.getStudentRequirementAuditReport(academicYear);
  }

  // =========================================================================
  // OPERATIONAL & HEADMASTER REPORTS
  // =========================================================================
  @Get("operational")
  @Roles('Primary-HeadMaster', 'Secondary-HeadMaster', 'DOS-Secondary', 'DOS-Tvet',)
  async getOperationalReport(
    @Query("scope") scope: "PRIMARY" | "NURSERY" | "LOWER SECONDARY" | "TVET" = "PRIMARY",
    @Query("academicYear") academicYear: string = "2026/2027",
    @Query("term") term: string = "TERM_1"
  ) {
    return this.reportsService.getOperationalReport(scope, academicYear, term);
  }
}