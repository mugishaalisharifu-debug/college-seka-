import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { DbModule } from 'src/db/db.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
@Module({
  imports: [DbModule, SupabaseModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService]
})
export class ApplicationsModule {}
