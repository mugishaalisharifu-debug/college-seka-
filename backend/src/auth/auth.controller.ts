import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { LoginDto } from 'common/dto/auth.dto';
import { AuthService } from './auth.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ─── 2. APPLY CUSTOM PROTECTION: Max 3 requests every 30 seconds ───
  @Throttle({ default: { limit: 3, ttl: 30000 } })
  @Post('login')
  async handleLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Get('staff-accounts')
  async getStaffAccounts() {
    return await this.authService.getStaffAccounts();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('staff-accounts')
  @HttpCode(HttpStatus.CREATED)
  async createStaffAccount(
    @Body()
    dto: {
      name: string;
      email: string;
      role: any;
      scope?: any;
      password?: string;
    },
  ) {
    return await this.authService.createStaffAccount(dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Patch('staff-accounts/:id')
  async updateStaffAccount(
    @Param('id') id: string,
    @Body() dto: { name?: string; email?: string; role?: any; scope?: any },
  ) {
    return await this.authService.updateStaffAccount(id, dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Delete('staff-accounts/:id')
  @HttpCode(HttpStatus.OK)
  async deleteStaffAccount(@Param('id') id: string) {
    return await this.authService.deleteStaffAccount(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('admin-reset-password')
  @HttpCode(HttpStatus.OK)
  async adminResetPassword(
    @Body()
    dto: {
      userId: string;
      newPassword: string;
      unlockAccount?: boolean;
      forcePasswordReset?: boolean;
    },
  ) {
    return await this.authService.adminResetPassword(dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Patch('admin-update-email')
  @HttpCode(HttpStatus.OK)
  async adminUpdateUserEmail(
    @Body()
    dto: {
      userId: string;
      email: string;
    },
  ) {
    return await this.authService.adminUpdateUserEmail(dto);
  }
}
