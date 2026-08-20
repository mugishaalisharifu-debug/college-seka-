import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
