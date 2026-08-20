import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';

@Injectable()
export class FinanceService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  private getTermOrder(term: 'TERM_1' | 'TERM_2' | 'TERM_3'): number {
    switch (term) {
      case 'TERM_1':
        return 1;
      case 'TERM_2':
        return 2;
      case 'TERM_3':
        return 3;
      default:
        return 0;
    }
  }

  // ==========================================
  // FEE STRUCTURE CRUD MANAGEMENT
  // ==========================================

  async createFeeStructure(data: any) {
    const [newFee] = await this.db
      .insert(schema.feeStructures)
      .values({
        academicYear: data.academicYear,
        term: data.term,
        scope: data.scope,
        tradeName: data.tradeName || null,
        name: data.name,
        amount: data.amount.toString(),
        isMandatory: data.isMandatory ?? true,
        isBoardingOnly: data.isBoardingOnly ?? false,
        isDayOnly: data.isDayOnly ?? false,
        isNewStudentOnly: data.isNewStudentOnly ?? false,
        customReason: data.customReason || null,
      })
      .returning();

    return {
      message: 'Fee structure created successfully',
      data: newFee,
    };
  }

  async saveBulkFeeStructure(fees: any[]) {
    if (!fees || fees.length === 0) {
      throw new BadRequestException('Fee list cannot be empty.');
    }

    const insertedFees = await this.db
      .insert(schema.feeStructures)
      .values(
        fees.map((fee) => ({
          academicYear: fee.academicYear,
          term: fee.term,
          scope: fee.scope,
          tradeName: fee.tradeName || null,
          name: fee.name,
          amount: fee.amount.toString(),
          isMandatory: fee.isMandatory ?? true,
          isBoardingOnly: fee.isBoardingOnly ?? false,
          isDayOnly: fee.isDayOnly ?? false,
          isNewStudentOnly: fee.isNewStudentOnly ?? false,
          customReason: fee.customReason || null,
        })),
      )
      .returning();

    return {
      message: 'Fee structures saved successfully',
      data: insertedFees,
    };
  }

  async getAllFeeStructures(
    academicYear?: string,
    term?: 'TERM_1' | 'TERM_2' | 'TERM_3',
    scope?: 'PRIMARY' | 'LOWER SECONDARY' | 'TVET' | 'NURSERY' | 'All',
  ) {
    const query = this.db.select().from(schema.feeStructures);

    const conditions: SQL[] = [];

    if (academicYear)
      conditions.push(eq(schema.feeStructures.academicYear, academicYear));
    if (term) conditions.push(eq(schema.feeStructures.term, term));
    if (scope) conditions.push(eq(schema.feeStructures.scope, scope));

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  async getFeeStructureById(id: string) {
    const [fee] = await this.db
      .select()
      .from(schema.feeStructures)
      .where(eq(schema.feeStructures.id, id));

    if (!fee) {
      throw new NotFoundException(`Fee structure with ID ${id} not found.`);
    }

    return fee;
  }

  async updateFeeStructure(id: string, data: any) {
    await this.getFeeStructureById(id);

    const updatePayload: Record<string, any> = {};

    if (data.academicYear !== undefined)
      updatePayload.academicYear = data.academicYear;
    if (data.term !== undefined) updatePayload.term = data.term;
    if (data.scope !== undefined) updatePayload.scope = data.scope;
    if (data.tradeName !== undefined)
      updatePayload.tradeName = data.tradeName || null;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.amount !== undefined)
      updatePayload.amount = data.amount.toString();
    if (data.isMandatory !== undefined)
      updatePayload.isMandatory = data.isMandatory;
    if (data.isBoardingOnly !== undefined)
      updatePayload.isBoardingOnly = data.isBoardingOnly;
    if (data.isDayOnly !== undefined) updatePayload.isDayOnly = data.isDayOnly;
    if (data.isNewStudentOnly !== undefined)
      updatePayload.isNewStudentOnly = data.isNewStudentOnly;
    if (data.customReason !== undefined)
      updatePayload.customReason = data.customReason || null;

    const [updatedFee] = await this.db
      .update(schema.feeStructures)
      .set(updatePayload)
      .where(eq(schema.feeStructures.id, id))
      .returning();

    return {
      message: 'Fee structure updated successfully',
      data: updatedFee,
    };
  }

  async deleteFeeStructure(id: string) {
    await this.getFeeStructureById(id);

    await this.db
      .delete(schema.feeStructures)
      .where(eq(schema.feeStructures.id, id));

    return {
      message: 'Fee structure head deleted successfully.',
    };
  }

  // ==========================================
  // STUDENT LEDGER & BILLING CALCULATIONS
  // ==========================================

  async getStudentLedger(
    studentId: string,
    currentAcademicYear?: string,
    currentTerm?: 'TERM_1' | 'TERM_2' | 'TERM_3',
  ) {
    const [studentData] = await this.db
      .select({
        student: schema.students,
        className: schema.classes.className,
      })
      .from(schema.students)
      .leftJoin(schema.classes, eq(schema.students.classId, schema.classes.id))
      .where(eq(schema.students.id, studentId));

    if (!studentData) {
      throw new NotFoundException(`Student with ID ${studentId} not found.`);
    }

    const { student, className } = studentData;

    const allFeeStructures = await this.db.select().from(schema.feeStructures);

    const targetTermOrder = currentTerm ? this.getTermOrder(currentTerm) : 3;

    const historicalApplicableFees = allFeeStructures.filter((fee) => {
      if (currentAcademicYear) {
        const isPastYear = fee.academicYear < currentAcademicYear;
        const isCurrentYearPastOrSameTerm =
          fee.academicYear === currentAcademicYear &&
          this.getTermOrder(fee.term) <= targetTermOrder;

        if (!isPastYear && !isCurrentYearPastOrSameTerm) {
          return false;
        }
      }

      if (fee.scope !== 'All' && fee.scope !== student.educationLevel) {
        return false;
      }

      if (student.educationLevel === 'TVET' && fee.tradeName) {
        if (fee.tradeName !== student.tradeName) {
          return false;
        }
      }

      const supportsBoardingDayScope =
        student.educationLevel === 'LOWER SECONDARY' ||
        student.educationLevel === 'TVET';

      if (supportsBoardingDayScope) {
        if (fee.isBoardingOnly && student.studentType !== 'BOARDING') {
          return false;
        }
        if (fee.isDayOnly && student.studentType !== 'DAY') {
          return false;
        }
      }

      if (fee.isNewStudentOnly && !student.isNewStudent) {
        return false;
      }

      return true;
    });

    const currentTermFees =
      currentAcademicYear && currentTerm
        ? historicalApplicableFees.filter(
            (fee) =>
              fee.academicYear === currentAcademicYear &&
              fee.term === currentTerm,
          )
        : historicalApplicableFees;

    const currentTermFeeTotal = currentTermFees.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const totalCumulativeFees = historicalApplicableFees.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const paymentHistory = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.studentId, studentId));

    const totalPaidHistorical = paymentHistory.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0,
    );

    const netOutstandingDebt = Math.max(
      0,
      totalCumulativeFees - totalPaidHistorical,
    );

    return {
      student: {
        id: student.id,
        regNumber: student.regNumber,
        name: student.studentName,
        educationLevel: student.educationLevel,
        className: className || undefined,
        tradeName: student.tradeName,
        studentType: student.studentType,
        isNewStudent: student.isNewStudent,
      },
      currentTermFeeBreakdown: currentTermFees,
      allApplicableHistoricalFees: historicalApplicableFees,
      paymentHistory,
      summary: {
        currentTermFee: currentTermFeeTotal,
        totalCumulativeFees,
        totalPaidHistorical,
        netOutstandingDebt,
        isFullyPaid: netOutstandingDebt === 0,
      },
    };
  }

  async getAllDebtors(
    academicYear?: string,
    term?: 'TERM_1' | 'TERM_2' | 'TERM_3',
  ) {
    const activeStudents = await this.db
      .select({
        student: schema.students,
        className: schema.classes.className,
      })
      .from(schema.students)
      .leftJoin(schema.classes, eq(schema.students.classId, schema.classes.id))
      .where(eq(schema.students.status, 'ACTIVE'));

    const debtors: any[] = [];

    for (const record of activeStudents) {
      const student = record.student;
      const ledger = await this.getStudentLedger(
        student.id,
        academicYear,
        term,
      );

      if (ledger.summary.netOutstandingDebt > 0) {
        debtors.push({
          studentId: student.id,
          regNumber: student.regNumber,
          studentName: student.studentName,
          className: record.className || 'N/A',
          educationLevel: student.educationLevel,
          tradeName: student.tradeName || null,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          totalOutstandingDebt: ledger.summary.netOutstandingDebt,
          currentTermFee: ledger.summary.currentTermFee,
          totalPaidHistorical: ledger.summary.totalPaidHistorical,
        });
      }
    }

    debtors.sort((a, b) => b.totalOutstandingDebt - a.totalOutstandingDebt);

    return debtors;
  }

  // ==========================================
  // PAYMENTS CRUD MANAGEMENT
  // ==========================================

  async recordPayment(
    paymentData: {
      studentId: string;
      amountPaid: number;
      academicPeriod: string;
      remarks?: string;
    },
    bursarId: string,
  ) {
    const { studentId, amountPaid, academicPeriod, remarks } = paymentData;

    if (amountPaid <= 0) {
      throw new BadRequestException(
        'Payment amount must be greater than zero.',
      );
    }

    const [student] = await this.db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    const uniqueSuffix = randomBytes(3).toString('hex').toUpperCase();
    const receiptNo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${uniqueSuffix}`;

    const [newPayment] = await this.db
      .insert(schema.payments)
      .values({
        receiptNo,
        studentId,
        amountPaid: amountPaid.toString(),
        academicPeriod,
        remarks: remarks || null,
        recordedBy: bursarId,
      })
      .returning();

    return {
      message: 'Payment recorded successfully',
      data: newPayment,
    };
  }

  async getPaymentById(id: string) {
    const [payment] = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, id));

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    return payment;
  }

  async getAllPayments(
    studentId?: string,
    academicPeriod?: string,
    recordedBy?: string,
  ) {
    const conditions: SQL[] = [];

    if (studentId) conditions.push(eq(schema.payments.studentId, studentId));
    if (academicPeriod)
      conditions.push(eq(schema.payments.academicPeriod, academicPeriod));
    if (recordedBy) conditions.push(eq(schema.payments.recordedBy, recordedBy));

    const query = this.db
      .select()
      .from(schema.payments)
      .orderBy(desc(schema.payments.createdAt));

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  async updatePayment(id: string, paymentData: any) {
    await this.getPaymentById(id);

    const updatePayload: Record<string, any> = {};

    if (paymentData.amountPaid !== undefined) {
      if (Number(paymentData.amountPaid) <= 0) {
        throw new BadRequestException(
          'Payment amount must be greater than zero.',
        );
      }
      updatePayload.amountPaid = paymentData.amountPaid.toString();
    }

    if (paymentData.academicPeriod !== undefined) {
      updatePayload.academicPeriod = paymentData.academicPeriod;
    }

    if (paymentData.remarks !== undefined) {
      updatePayload.remarks = paymentData.remarks || null;
    }

    const [updatedPayment] = await this.db
      .update(schema.payments)
      .set(updatePayload)
      .where(eq(schema.payments.id, id))
      .returning();

    return {
      message: 'Payment record updated successfully',
      data: updatedPayment,
    };
  }

  async deletePayment(id: string) {
    await this.getPaymentById(id);

    await this.db.delete(schema.payments).where(eq(schema.payments.id, id));

    return {
      message: 'Payment record deleted successfully.',
    };
  }
}
