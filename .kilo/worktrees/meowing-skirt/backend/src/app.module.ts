import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { CashierModule } from './cashier/cashier.module';
import { DosModule } from './dos/dos.module';
import { SupabaseModule } from './supabase/supabase.module';
import { RequirementsModule } from './requirements/requirements.module';
import { ApplicationsModule } from './applications/applications.module';
import { StoreManagerModule } from './store-manager/store-manager.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailModule } from './email/email.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    AuthModule,
    FinanceModule,
    ApplicationsModule,
    CashierModule,
    DosModule,
    SupabaseModule,
    RequirementsModule,
    StoreManagerModule,
    AdminModule,
    ReportsModule,
    CloudinaryModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}