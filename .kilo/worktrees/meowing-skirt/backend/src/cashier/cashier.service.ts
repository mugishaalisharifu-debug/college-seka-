import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>
  ) {}

  async getAllItems() {
    return await this.db
      .select()
      .from(schema.inventoryItems)
      .orderBy(schema.inventoryItems.name);
  }

  async createItem(dto: { name: string; category: string; unit: 'kg' | 'liters' | 'bags' }) {
    const existing = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.name, dto.name));

    if (existing.length > 0) {
      throw new BadRequestException('A food item with this name already exists.');
    }

    const [newItem] = await this.db
      .insert(schema.inventoryItems)
      .values({
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        availableQuantity: '0',
      })
      .returning();

    return newItem;
  }

  async updateItem(
    id: string,
    dto: { name?: string; category?: string; unit?: 'kg' | 'liters' | 'bags' }
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, id));

    if (!existing) {
      throw new NotFoundException('Inventory food item not found.');
    }

    if (dto.name && dto.name !== existing.name) {
      const [dup] = await this.db
        .select()
        .from(schema.inventoryItems)
        .where(eq(schema.inventoryItems.name, dto.name));

      if (dup) {
        throw new BadRequestException('A food item with this name already exists.');
      }
    }

    const [updated] = await this.db
      .update(schema.inventoryItems)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
      })
      .where(eq(schema.inventoryItems.id, id))
      .returning();

    return updated;
  }

  async deleteItem(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, id));

    if (!existing) {
      throw new NotFoundException('Inventory food item not found.');
    }

    await this.db
      .delete(schema.inventoryTransactions)
      .where(eq(schema.inventoryTransactions.itemId, id));

    await this.db
      .delete(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, id));

    return { message: 'Inventory item deleted successfully.' };
  }

  async recordStockIn(
    dto: {
      itemId: string;
      quantity: number;
      supplier?: string;
      invoiceNumber?: string;
      dateReceived: string;
      notes?: string;
    },
    cashierId: string
  ) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }

    const [item] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, dto.itemId));

    if (!item) {
      throw new NotFoundException('Inventory food item not found.');
    }

    const newQty = Number(item.availableQuantity) + dto.quantity;

    await this.db
      .update(schema.inventoryItems)
      .set({ availableQuantity: newQty.toString() })
      .where(eq(schema.inventoryItems.id, dto.itemId));

    const [transaction] = await this.db
      .insert(schema.inventoryTransactions)
      .values({
        itemId: dto.itemId,
        type: 'STOCK_IN',
        quantity: dto.quantity.toString(),
        supplier: dto.supplier || 'Direct Purchase',
        invoiceNumber: dto.invoiceNumber || 'N/A',
        dateReceived: dto.dateReceived,
        recordedBy: cashierId,
        notes: dto.notes,
      })
      .returning();

    return {
      message: 'Stock In recorded successfully',
      transaction,
      updatedBalance: newQty,
    };
  }

  async recordStockOut(
    dto: {
      itemId: string;
      quantity: number;
      mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Special Event' | 'Other';
      issuedTo?: string;
      dateIssued: string;
      timeIssued?: string;
      notes?: string;
    },
    cashierId: string
  ) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity released must be greater than zero.');
    }

    const [item] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, dto.itemId));

    if (!item) {
      throw new NotFoundException('Inventory food item not found.');
    }

    const currentAvailable = Number(item.availableQuantity);
    if (dto.quantity > currentAvailable) {
      throw new BadRequestException(
        `Insufficient stock! Only ${currentAvailable} ${item.unit} of ${item.name} available in store.`
      );
    }

    const newQty = currentAvailable - dto.quantity;

    await this.db
      .update(schema.inventoryItems)
      .set({ availableQuantity: newQty.toString() })
      .where(eq(schema.inventoryItems.id, dto.itemId));

    const [transaction] = await this.db
      .insert(schema.inventoryTransactions)
      .values({
        itemId: dto.itemId,
        type: 'STOCK_OUT',
        quantity: dto.quantity.toString(),
        mealType: dto.mealType,
        issuedTo: dto.issuedTo || 'Kitchen Staff',
        dateIssued: dto.dateIssued,
        timeIssued: dto.timeIssued || 'N/A',
        recordedBy: cashierId,
        notes: dto.notes,
      })
      .returning();

    return {
      message: 'Stock released successfully',
      transaction,
      updatedBalance: newQty,
    };
  }

  async getTransactionHistory(type?: 'STOCK_IN' | 'STOCK_OUT' | 'SPOILAGE') {
    const query = this.db
      .select({
        id: schema.inventoryTransactions.id,
        itemName: schema.inventoryItems.name,
        category: schema.inventoryItems.category,
        unit: schema.inventoryItems.unit,
        type: schema.inventoryTransactions.type,
        quantity: schema.inventoryTransactions.quantity,

        // Stock-In Fields
        supplier: schema.inventoryTransactions.supplier,
        invoiceNumber: schema.inventoryTransactions.invoiceNumber,
        dateReceived: schema.inventoryTransactions.dateReceived,

        // Stock-Out Fields
        mealType: schema.inventoryTransactions.mealType,
        issuedTo: schema.inventoryTransactions.issuedTo,
        dateIssued: schema.inventoryTransactions.dateIssued,
        timeIssued: schema.inventoryTransactions.timeIssued,

        // Spoilage Fields (NOW INCLUDED!)
        spoilageReason: schema.inventoryTransactions.spoilageReason,
        dateReported: schema.inventoryTransactions.dateReported,
        timeReported: schema.inventoryTransactions.timeReported,

        // Common Fields
        notes: schema.inventoryTransactions.notes,
        createdAt: schema.inventoryTransactions.createdAt,
      })
      .from(schema.inventoryTransactions)
      .innerJoin(
        schema.inventoryItems,
        eq(schema.inventoryTransactions.itemId, schema.inventoryItems.id)
      )
      .orderBy(desc(schema.inventoryTransactions.createdAt));

    if (type) {
      return await query.where(eq(schema.inventoryTransactions.type, type));
    }

    return await query;
  }
  
  async recordSpoilage(
    dto: {
      itemId: string;
      quantity: number;
      reason:
        | 'Water Damage / Rain'
        | 'Pest Infestation'
        | 'Expired'
        | 'Transportation / Bag Tear'
        | 'Other Spoilage';
      dateReported: string;
      timeReported?: string;
      notes?: string;
    },
    cashierId: string
  ) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Spoiled quantity must be greater than zero.');
    }

    const [item] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, dto.itemId));

    if (!item) {
      throw new NotFoundException('Inventory food item not found.');
    }

    const currentAvailable = Number(item.availableQuantity);
    if (dto.quantity > currentAvailable) {
      throw new BadRequestException(
        `Invalid quantity! Cannot log ${dto.quantity} ${item.unit} as spoiled because only ${currentAvailable} ${item.unit} are available.`
      );
    }

    const newQty = currentAvailable - dto.quantity;

    await this.db
      .update(schema.inventoryItems)
      .set({ availableQuantity: newQty.toString() })
      .where(eq(schema.inventoryItems.id, dto.itemId));

    const [transaction] = await this.db
      .insert(schema.inventoryTransactions)
      .values({
        itemId: dto.itemId,
        type: 'SPOILAGE',
        quantity: dto.quantity.toString(),
        spoilageReason: dto.reason,
        dateReported: dto.dateReported,
        timeReported: dto.timeReported || 'N/A',
        recordedBy: cashierId,
        notes: dto.notes,
      })
      .returning();

    return {
      message: 'Spoilage logged successfully',
      transaction,
      updatedBalance: newQty,
    };
  }

  async updateTransaction(id: string, dto: any) {
    const [transaction] = await this.db
      .select()
      .from(schema.inventoryTransactions)
      .where(eq(schema.inventoryTransactions.id, id));

    if (!transaction) {
      throw new NotFoundException('Inventory transaction not found.');
    }

    const [item] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, transaction.itemId));

    if (!item) {
      throw new NotFoundException('Associated inventory item not found.');
    }

    const oldQty = Number(transaction.quantity);
    const newQtyRaw =
      dto.quantity !== undefined ? Number(dto.quantity) : oldQty;

    if (dto.quantity !== undefined && newQtyRaw <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }

    // Revert the old effect on the item balance, then apply the new one.
    let balance = Number(item.availableQuantity);
    if (transaction.type === 'STOCK_IN') {
      balance -= oldQty;
    } else {
      balance += oldQty;
    }

    if (transaction.type === 'STOCK_IN') {
      balance += newQtyRaw;
    } else {
      if (newQtyRaw > balance) {
        throw new BadRequestException(
          `Insufficient stock! Only ${balance} ${item.unit} of ${item.name} available.`
        );
      }
      balance -= newQtyRaw;
    }

    await this.db
      .update(schema.inventoryItems)
      .set({ availableQuantity: balance.toString() })
      .where(eq(schema.inventoryItems.id, item.id));

    const updatePayload: Record<string, any> = {};
    if (dto.quantity !== undefined) updatePayload.quantity = newQtyRaw.toString();
    if (dto.supplier !== undefined) updatePayload.supplier = dto.supplier;
    if (dto.invoiceNumber !== undefined)
      updatePayload.invoiceNumber = dto.invoiceNumber;
    if (dto.mealType !== undefined) updatePayload.mealType = dto.mealType;
    if (dto.issuedTo !== undefined) updatePayload.issuedTo = dto.issuedTo;
    if (dto.spoilageReason !== undefined)
      updatePayload.spoilageReason = dto.spoilageReason;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;

    const [updated] = await this.db
      .update(schema.inventoryTransactions)
      .set(updatePayload)
      .where(eq(schema.inventoryTransactions.id, id))
      .returning();

    return { message: 'Transaction updated successfully', transaction: updated };
  }

  async deleteTransaction(id: string) {
    const [transaction] = await this.db
      .select()
      .from(schema.inventoryTransactions)
      .where(eq(schema.inventoryTransactions.id, id));

    if (!transaction) {
      throw new NotFoundException('Inventory transaction not found.');
    }

    const [item] = await this.db
      .select()
      .from(schema.inventoryItems)
      .where(eq(schema.inventoryItems.id, transaction.itemId));

    if (item) {
      const qty = Number(transaction.quantity);
      let balance = Number(item.availableQuantity);
      if (transaction.type === 'STOCK_IN') {
        balance -= qty;
      } else {
        balance += qty;
      }
      await this.db
        .update(schema.inventoryItems)
        .set({ availableQuantity: balance.toString() })
        .where(eq(schema.inventoryItems.id, item.id));
    }

    await this.db
      .delete(schema.inventoryTransactions)
      .where(eq(schema.inventoryTransactions.id, id));

    return { message: 'Transaction deleted successfully.' };
  }
}