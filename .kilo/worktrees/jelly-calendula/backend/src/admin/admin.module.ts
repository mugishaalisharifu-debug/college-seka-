import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DbModule } from '../db/db.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [DbModule, CloudinaryModule, SupabaseModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}