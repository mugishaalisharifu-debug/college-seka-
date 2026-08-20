import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class RequirementsService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  // Fetch all requirements with linked class names
  async getMasterItems() {
    return await this.db
      .select({
        id: schema.requirementItems.id,
        name: schema.requirementItems.name,
        category: schema.requirementItems.category,
        scope: schema.requirementItems.scope,
        classId: schema.requirementItems.classId,
        className: schema.classes.className,
        academicYear: schema.requirementItems.academicYear,
        description: schema.requirementItems.description,
        createdAt: schema.requirementItems.createdAt,
      })
      .from(schema.requirementItems)
      .leftJoin(
        schema.classes,
        eq(schema.requirementItems.classId, schema.classes.id),
      )
      .orderBy(schema.requirementItems.name);
  }

  // Fetch all classes created in the system
  async getAllClasses() {
    return await this.db
      .select({
        id: schema.classes.id,
        className: schema.classes.className,
        scope: schema.classes.scope,
        tradeName: schema.classes.tradeName,
      })
      .from(schema.classes)
      .orderBy(schema.classes.className);
  }

  // Create requirement bound to either a whole scope or a specific classId
  async createMasterItem(dto: {
    name: string;
    category: 'Boarding / Tools' | 'Academic Supplies' | 'Personal Care / Fees';
    scope?: any;
    classId?: string;
    academicYear: string;
    description?: string;
  }) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Requirement item name is required.');
    }

    if (!dto.academicYear || !dto.academicYear.trim()) {
      throw new BadRequestException('Academic year is required.');
    }

    const [item] = await this.db
      .insert(schema.requirementItems)
      .values({
        name: dto.name.trim(),
        category: dto.category,
        scope: dto.scope || 'All',
        classId: dto.classId || null,
        academicYear: dto.academicYear.trim(),
        description: dto.description?.trim() || null,
      })
      .returning();

    // Ensure corresponding Store Item entry exists for the Store Manager inventory
    const [existingStoreItem] = await this.db
      .select()
      .from(schema.storeItems)
      .where(eq(schema.storeItems.name, dto.name.trim()));

    if (!existingStoreItem) {
      await this.db.insert(schema.storeItems).values({
        name: dto.name.trim(),
        category: dto.category,
        availableQuantity: '0',
        unit: 'pcs',
      });
    }

    return item;
  }

  async updateMasterItem(
    id: string,
    dto: {
      name?: string;
      category?:
        'Boarding / Tools' | 'Academic Supplies' | 'Personal Care / Fees';
      scope?: any;
      classId?: string;
      academicYear?: string;
      description?: string;
    },
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.requirementItems)
      .where(eq(schema.requirementItems.id, id));

    if (!existing) {
      throw new NotFoundException('Requirement item not found.');
    }

    const [updated] = await this.db
      .update(schema.requirementItems)
      .set({
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.category && { category: dto.category }),
        ...(dto.scope && { scope: dto.scope }),
        ...(dto.classId !== undefined && { classId: dto.classId || null }),
        ...(dto.academicYear && { academicYear: dto.academicYear.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
      })
      .where(eq(schema.requirementItems.id, id))
      .returning();

    return updated;
  }

  async deleteMasterItem(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.requirementItems)
      .where(eq(schema.requirementItems.id, id));

    if (!existing) {
      throw new NotFoundException('Requirement item not found.');
    }

    await this.db
      .delete(schema.requirementItems)
      .where(eq(schema.requirementItems.id, id));

    return { message: 'Requirement item deleted successfully' };
  }

  // Fetch check-in directory with student details and checked items
  async getCheckInDirectory() {
    const allStudents = await this.db
      .select({
        id: schema.students.id,
        studentName: schema.students.studentName,
        classId: schema.students.classId,
        className: schema.classes.className,
        educationLevel: schema.students.educationLevel,
        parentPhone: schema.students.parentPhone,
      })
      .from(schema.students)
      .leftJoin(schema.classes, eq(schema.students.classId, schema.classes.id));

    const allChecks = await this.db
      .select()
      .from(schema.studentRequirementChecks)
      .where(eq(schema.studentRequirementChecks.isBrought, true));

    const allNotes = await this.db
      .select()
      .from(schema.studentRequirementNotes);

    const notesMap = new Map(allNotes.map((n) => [n.studentId, n.notes]));

    return allStudents.map((st) => {
      const broughtItemIds = allChecks
        .filter((c) => c.studentId === st.id)
        .map((c) => c.requirementItemId);

      return {
        ...st,
        className: st.className || 'N/A',
        broughtItemIds,
        notes: notesMap.get(st.id) || '',
      };
    });
  }

  // Save student clearance and sync items into Store Manager Inventory
  async saveStudentClearance(
    studentId: string,
    dto: {
      broughtItemIds: string[];
      notes?: string;
      academicYear: string;
      term: 'TERM_1' | 'TERM_2' | 'TERM_3';
    },
    inspectorId: string,
  ) {
    const [student] = await this.db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return await this.db.transaction(async (tx) => {
      // Step 1: Remove old requirement checks for clean update
      await tx
        .delete(schema.studentRequirementChecks)
        .where(eq(schema.studentRequirementChecks.studentId, studentId));

      // Step 2: Record new requirement checks
      if (dto.broughtItemIds && dto.broughtItemIds.length > 0) {
        const checkRecords = dto.broughtItemIds.map((itemId) => ({
          studentId,
          requirementItemId: itemId,
          isBrought: true,
          inspectedBy: inspectorId,
        }));

        await tx.insert(schema.studentRequirementChecks).values(checkRecords);

        // Step 3: Process items into Store Manager's Inventory & Ledger
        for (const reqItemId of dto.broughtItemIds) {
          const [reqItem] = await tx
            .select()
            .from(schema.requirementItems)
            .where(eq(schema.requirementItems.id, reqItemId));

          if (!reqItem) continue;

          // Find or create Store Item catalog entry
          let [storeItem] = await tx
            .select()
            .from(schema.storeItems)
            .where(eq(schema.storeItems.name, reqItem.name));

          if (!storeItem) {
            [storeItem] = await tx
              .insert(schema.storeItems)
              .values({
                name: reqItem.name,
                category: reqItem.category,
                availableQuantity: '0',
                unit: 'pcs',
              })
              .returning();
          }

          // Check if deposit already logged for this term/year
          const [existingDeposit] = await tx
            .select()
            .from(schema.studentStoreDeposits)
            .where(
              and(
                eq(schema.studentStoreDeposits.studentId, studentId),
                eq(schema.studentStoreDeposits.storeItemId, storeItem.id),
                eq(schema.studentStoreDeposits.academicYear, dto.academicYear),
                eq(schema.studentStoreDeposits.term, dto.term),
              ),
            );

          if (!existingDeposit) {
            // Log new deposit
            const [deposit] = await tx
              .insert(schema.studentStoreDeposits)
              .values({
                studentId,
                storeItemId: storeItem.id,
                requirementItemId: reqItem.id,
                quantityBrought: '1',
                receivedBy: inspectorId,
                academicYear: dto.academicYear,
                term: dto.term,
              })
              .returning();

            // Increment Store Manager inventory balance
            await tx
              .update(schema.storeItems)
              .set({
                availableQuantity: sql`${schema.storeItems.availableQuantity} + 1`,
              })
              .where(eq(schema.storeItems.id, storeItem.id));

            // Log store deposit transaction
            await tx.insert(schema.storeTransactions).values({
              storeItemId: storeItem.id,
              depositId: deposit.id,
              type: 'STUDENT_DEPOSIT',
              quantity: '1',
              recordedBy: inspectorId,
              notes: `Received from student ${student.studentName}`,
            });
          }
        }
      }

      // Step 4: Save or update collector notes
      if (dto.notes !== undefined) {
        await tx
          .insert(schema.studentRequirementNotes)
          .values({
            studentId,
            notes: dto.notes.trim(),
          })
          .onConflictDoUpdate({
            target: schema.studentRequirementNotes.studentId,
            set: { notes: dto.notes.trim(), updatedAt: new Date() },
          });
      }

      return { message: 'Clearance record saved and store inventory updated' };
    });
  }

  // Fetch all store items managed by Store Manager
  async getStoreInventory() {
    return await this.db
      .select()
      .from(schema.storeItems)
      .orderBy(schema.storeItems.name);
  }

  // Issue item out from Store Manager inventory
  async issueStoreItem(dto: {
    storeItemId: string;
    quantity: number;
    issuedTo: string;
    recordedBy: string;
    notes?: string;
  }) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }

    return await this.db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(schema.storeItems)
        .where(eq(schema.storeItems.id, dto.storeItemId));

      if (!item) {
        throw new NotFoundException('Store item not found.');
      }

      if (parseFloat(item.availableQuantity) < dto.quantity) {
        throw new BadRequestException('Insufficient inventory balance.');
      }

      // Deduct quantity from store item balance
      await tx
        .update(schema.storeItems)
        .set({
          availableQuantity: sql`${schema.storeItems.availableQuantity} - ${dto.quantity}`,
        })
        .where(eq(schema.storeItems.id, dto.storeItemId));

      // Record transaction ledger entry
      await tx.insert(schema.storeTransactions).values({
        storeItemId: dto.storeItemId,
        type: 'ISSUED_OUT',
        quantity: dto.quantity.toString(),
        issuedTo: dto.issuedTo,
        recordedBy: dto.recordedBy,
        notes: dto.notes?.trim() || null,
      });

      return { message: 'Item issued successfully from store' };
    });
  }
}
