import { Body, Controller, Get, Post, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { LoginDto } from 'common/dto/auth.dto';
import { AuthService } from './auth.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';
import { Throttle } from '@nestjs/throttler'; 

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    // ─── 2. APPLY CUSTOM PROTECTION: Max 3 requests every 30 seconds ───
    @Throttle({ default: { limit: 3, ttl: 30000 } })
    @Post('login')
    async handleLogin(@Body() loginDto: LoginDto){
       return this.authService.login(loginDto);
    }

    @UseGuards(JwtGuard)
    @Get('profile')
    async getProfile(@Req() req: any){
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
