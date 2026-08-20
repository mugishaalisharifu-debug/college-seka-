import { Module } from '@nestjs/common';
import { StoreManagerService } from './store-manager.service';
import { StoreManagerController } from './store-manager.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [StoreManagerController],
  providers: [StoreManagerService],
  exports: [StoreManagerService],
})
export class StoreManagerModule {}