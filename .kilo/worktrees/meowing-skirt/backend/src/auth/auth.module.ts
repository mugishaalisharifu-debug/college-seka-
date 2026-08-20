import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthStrategy } from 'common/strategies/jwt.strategy'
import { DbModule } from 'src/db/db.module';
import'dotenv/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "1d" }
      }),
    }),
    PassportModule.register({ defaultStrategy: 'auth' }),
    DbModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy]
})
export class AuthModule {}

