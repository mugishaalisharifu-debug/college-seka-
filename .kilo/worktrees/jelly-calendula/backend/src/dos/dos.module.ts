import { Module } from '@nestjs/common';
import { DosController } from './dos.controller';
import { DosService } from './dos.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { DbModule } from 'src/db/db.module';
@Module({
  imports: [SupabaseModule, DbModule],
  controllers: [DosController],
  providers: [DosService]
})
export class DosModule {}
