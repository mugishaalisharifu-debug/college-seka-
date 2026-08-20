import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './cashier.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@Controller('inventory')
@UseGuards(JwtGuard, RoleGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('items')
  @Roles('Cashier', 'Secondary-HeadMaster')
  async getItems() {
    return await this.inventoryService.getAllItems();
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Cashier')
  async createItem(
    @Body() dto: { name: string; category: string; unit: 'kg' | 'liters' | 'bags' }
  ) {
    return await this.inventoryService.createItem(dto);
  }

  @Patch('items/:id')
  @Roles('Cashier')
  async updateItem(
    @Param('id') id: string,
    @Body()
    dto: { name?: string; category?: string; unit?: 'kg' | 'liters' | 'bags' },
  ) {
    return await this.inventoryService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Cashier')
  async deleteItem(@Param('id') id: string) {
    return await this.inventoryService.deleteItem(id);
  }

  @Post('stock-in')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Cashier')
  async stockIn(
    @Body()
    dto: {
      itemId: string;
      quantity: number;
      supplier?: string;
      invoiceNumber?: string;
      dateReceived: string;
      notes?: string;
    },
    @Req() req: any
  ) {
    return await this.inventoryService.recordStockIn(dto, req.user.id);
  }

  @Post('stock-out')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Cashier')
  async stockOut(
    @Body()
    dto: {
      itemId: string;
      quantity: number;
      mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Special Event' | 'Other';
      issuedTo?: string;
      dateIssued: string;
      timeIssued?: string;
      notes?: string;
    },
    @Req() req: any
  ) {
    return await this.inventoryService.recordStockOut(dto, req.user.id);
  }

  @Get('history')
  @Roles('Cashier')
  async getHistory(@Query('type') type?: 'STOCK_IN' | 'STOCK_OUT' | 'SPOILAGE') {
    return await this.inventoryService.getTransactionHistory(type);
  }
  @Post('spoilage')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Cashier')
  async recordSpoilage(
    @Body()
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
    @Req() req: any
  ) {
    return await this.inventoryService.recordSpoilage(dto, req.user.id);
  }

  @Patch('transactions/:id')
  @Roles('Cashier')
  async updateTransaction(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.inventoryService.updateTransaction(id, dto);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Cashier')
  async deleteTransaction(@Param('id') id: string) {
    return await this.inventoryService.deleteTransaction(id);
  }
}