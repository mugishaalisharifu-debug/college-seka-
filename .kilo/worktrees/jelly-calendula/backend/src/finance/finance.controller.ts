import {
  Controller,
  Get,
  Req,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@Controller('finance')
@UseGuards(JwtGuard, RoleGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ==========================================
  // FEE STRUCTURE MANAGEMENT ROUTES
  // ==========================================

  @Post('fee-structures')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Bursar')
  async createFeeStructure(@Body() body: any) {
    if (!body.academicYear || !body.term || !body.scope || !body.name || !body.amount) {
      throw new BadRequestException('Missing required fee structure fields.');
    }
    return await this.financeService.createFeeStructure(body);
  }

  @Post('fee-structures/bulk')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Bursar')
  async saveBulkFees(@Body() body: { fees: any[] }) {
    if (!body.fees || !Array.isArray(body.fees) || body.fees.length === 0) {
      throw new BadRequestException('Fees array cannot be empty.');
    }
    return await this.financeService.saveBulkFeeStructure(body.fees);
  }

  @Get('fee-structures')
  @Roles('Bursar')
  async getAllFeeStructures(
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: 'TERM_1' | 'TERM_2' | 'TERM_3',
    @Query('scope') scope?: 'PRIMARY' | 'LOWER SECONDARY' | 'TVET' | 'NURSERY' | 'All',
  ) {
    return await this.financeService.getAllFeeStructures(
      academicYear,
      term,
      scope,
    );
  }

  @Get('fee-structures/:id')
  @Roles('Bursar')
  async getFeeStructureById(@Param('id') id: string) {
    return await this.financeService.getFeeStructureById(id);
  }

  @Patch('fee-structures/:id')
  @Roles('Bursar')
  async updateFeeStructure(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return await this.financeService.updateFeeStructure(id, body);
  }

  @Delete('fee-structures/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Bursar')
  async deleteFeeStructure(@Param('id') id: string) {
    return await this.financeService.deleteFeeStructure(id);
  }

  // ==========================================
  // LEDGER, DEBTORS & PAYMENTS ROUTES
  // ==========================================

  @Get('ledger/:studentId')
  @Roles('Bursar')
  async getStudentsLedger(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: 'TERM_1' | 'TERM_2' | 'TERM_3',
  ) {
    return await this.financeService.getStudentLedger(
      studentId,
      academicYear,
      term,
    );
  }

  @Get('debtors')
  @Roles('Bursar')
  async getAllDebtors(
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: 'TERM_1' | 'TERM_2' | 'TERM_3',
  ) {
    return await this.financeService.getAllDebtors(academicYear, term);
  }

  @Get('payments')
  @Roles('Bursar')
  async getAllPayments(
    @Query('studentId') studentId?: string,
    @Query('academicPeriod') academicPeriod?: string,
    @Query('recordedBy') recordedBy?: string,
  ) {
    return await this.financeService.getAllPayments(
      studentId,
      academicPeriod,
      recordedBy,
    );
  }

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Bursar')
  async recordPayment(
    @Body()
    paymentBody: {
      studentId: string;
      amountPaid: number;
      academicPeriod: string;
      remarks?: string;
    },
    @Req() req: any,
  ) {
    if (
      !paymentBody.studentId ||
      !paymentBody.amountPaid ||
      paymentBody.amountPaid <= 0
    ) {
      throw new BadRequestException('Invalid payment details provided.');
    }

    return await this.financeService.recordPayment(paymentBody, req.user.id);
  }

  @Get('payments/:id')
  @Roles('Bursar')
  async getPaymentById(@Param('id') id: string) {
    return await this.financeService.getPaymentById(id);
  }

  @Patch('payments/:id')
  @Roles('Bursar')
  async updatePayment(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return await this.financeService.updatePayment(id, body);
  }

  @Delete('payments/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Bursar')
  async deletePayment(@Param('id') id: string) {
    return await this.financeService.deletePayment(id);
  }
}