import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc, sql } from 'drizzle-orm';

@Injectable()
export class StoreManagerService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>
  ) {}

  async getCollectedStock() {
    return await this.db
      .select({
        id: schema.storeItems.id,
        itemName: schema.storeItems.name,
        category: schema.storeItems.category,
        currentBalance: schema.storeItems.availableQuantity,
        unit: schema.storeItems.unit,
        createdAt: schema.storeItems.createdAt,
      })
      .from(schema.storeItems)
      .orderBy(schema.storeItems.name);
  }

  async createOrUpdateStockItem(dto: {
    id?: string;
    itemName: string;
    category: 'Boarding / Tools' | 'Academic Supplies' | 'Personal Care / Fees';
    quantity: number;
    unit?: string;
  }) {
    if (!dto.itemName || !dto.itemName.trim()) {
      throw new BadRequestException('Item name is required.');
    }

    if (dto.id) {
      const [updated] = await this.db
        .update(schema.storeItems)
        .set({
          name: dto.itemName.trim(),
          category: dto.category,
          availableQuantity: dto.quantity.toString(),
          unit: dto.unit || 'pcs',
        })
        .where(eq(schema.storeItems.id, dto.id))
        .returning();

      if (!updated) {
        throw new NotFoundException('Stock item not found.');
      }
      return updated;
    }

    const [newItem] = await this.db
      .insert(schema.storeItems)
      .values({
        name: dto.itemName.trim(),
        category: dto.category,
        availableQuantity: dto.quantity.toString(),
        unit: dto.unit || 'pcs',
      })
      .returning();

    return newItem;
  }

  async deleteStockItem(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.storeItems)
      .where(eq(schema.storeItems.id, id));

    if (!existing) {
      throw new NotFoundException('Stock item not found.');
    }

    await this.db
      .delete(schema.storeTransactions)
      .where(eq(schema.storeTransactions.storeItemId, id));

    await this.db
      .delete(schema.studentStoreDeposits)
      .where(eq(schema.studentStoreDeposits.storeItemId, id));

    await this.db
      .delete(schema.storeItems)
      .where(eq(schema.storeItems.id, id));

    return { message: 'Stock item deleted successfully.' };
  }

  async getUsageLogs() {
    return await this.db
      .select({
        id: schema.storeTransactions.id,
        item: schema.storeItems.name,
        type: schema.storeTransactions.type,
        quantity: schema.storeTransactions.quantity,
        department: schema.storeTransactions.issuedTo,
        authorizedBy: schema.users.name,
        notes: schema.storeTransactions.notes,
        createdAt: schema.storeTransactions.createdAt,
      })
      .from(schema.storeTransactions)
      .innerJoin(
        schema.storeItems,
        eq(schema.storeTransactions.storeItemId, schema.storeItems.id)
      )
      .innerJoin(
        schema.users,
        eq(schema.storeTransactions.recordedBy, schema.users.id)
      )
      .orderBy(desc(schema.storeTransactions.createdAt));
  }

  async logStockConsumption(
    dto: {
      storeItemId: string;
      quantity: number;
      department: string;
      notes?: string;
    },
    userId: string
  ) {
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
        throw new BadRequestException('Insufficient balance in store.');
      }

      await tx
        .update(schema.storeItems)
        .set({
          availableQuantity: sql`${schema.storeItems.availableQuantity} - ${dto.quantity}`,
        })
        .where(eq(schema.storeItems.id, dto.storeItemId));

      const [log] = await tx
        .insert(schema.storeTransactions)
        .values({
          storeItemId: dto.storeItemId,
          type: 'ISSUED_OUT',
          quantity: dto.quantity.toString(),
          issuedTo: dto.department.trim(),
          recordedBy: userId,
          notes: dto.notes?.trim() || null,
        })
        .returning();

      return log;
    });
  }

  async deleteUsageLog(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.storeTransactions)
      .where(eq(schema.storeTransactions.id, id));

    if (!existing) {
      throw new NotFoundException('Usage log entry not found.');
    }

    await this.db
      .delete(schema.storeTransactions)
      .where(eq(schema.storeTransactions.id, id));

    return { message: 'Usage log entry deleted successfully.' };
  }
}