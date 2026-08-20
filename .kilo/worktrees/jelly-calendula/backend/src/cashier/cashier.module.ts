import { Module } from '@nestjs/common';
import { InventoryController } from './cashier.controller';
import { InventoryService } from './cashier.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [InventoryController],
  providers: [InventoryService]
})
export class CashierModule {}
