import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { StoreManagerService } from './store-manager.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Roles('Store-Manager')
@Controller('store-manager')
export class StoreManagerController {
  constructor(private readonly storeManagerService: StoreManagerService) {}

  @Get('stock')
  async getCollectedStock() {
    return await this.storeManagerService.getCollectedStock();
  }

  @Post('stock')
  @HttpCode(HttpStatus.OK)
  async createOrUpdateStockItem(
    @Body()
    dto: {
      id?: string;
      itemName: string;
      category: 'Boarding / Tools' | 'Academic Supplies' | 'Personal Care / Fees';
      quantity: number;
      unit?: string;
    }
  ) {
    return await this.storeManagerService.createOrUpdateStockItem(dto);
  }

  @Delete('stock/:id')
  async deleteStockItem(@Param('id') id: string) {
    return await this.storeManagerService.deleteStockItem(id);
  }

  @Get('usage-logs')
  async getUsageLogs() {
    return await this.storeManagerService.getUsageLogs();
  }

  @Post('usage-logs')
  @HttpCode(HttpStatus.CREATED)
  async logStockConsumption(
    @Body()
    dto: {
      storeItemId: string;
      quantity: number;
      department: string;
      notes?: string;
    },
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid user session.');
    }
    return await this.storeManagerService.logStockConsumption(dto, userId);
  }

  @Delete('usage-logs/:id')
  async deleteUsageLog(@Param('id') id: string) {
    return await this.storeManagerService.deleteUsageLog(id);
  }
}