import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { DRIZZLE } from 'src/db/db.provider';
import { LoginDtos } from 'common/dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async generateToken(userId: string, role: string) {
    const payload = { userId, role };
    return this.jwtService.sign(payload);
  }

  async login(loginDto: LoginDtos) {
    const { email, password } = loginDto;

    // FIX: Changed 'tables.users' to 'schema.users'
    const [userExists] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (!userExists) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const token = await this.generateToken(userExists.id, userExists.role);

    return {
      access_token: token,
      user: {
        id: userExists.id,
        email: userExists.email,
        name: userExists.name,
        role: userExists.role,
      },
    };
  }

  // --- ACCOUNT RECOVERY & STAFF MANAGEMENT SERVICES ---

  // Get all staff system users
  async getStaffAccounts() {
    const staffList = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        scope: schema.users.scope,
      })
      .from(schema.users);

    return staffList;
  }

  // Reset a staff member's password
  async adminResetPassword(dto: {
    userId: string;
    newPassword: string;
    unlockAccount?: boolean;
    forcePasswordReset?: boolean;
  }) {
    const { userId, newPassword } = dto;

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }

    // FIX: Changed 'tables.users' to 'schema.users'
    const [userExists] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!userExists) {
      throw new NotFoundException('User account not found.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // FIX: Changed 'tables.users' to 'schema.users'
    const [updatedUser] = await this.db
      .update(schema.users)
      .set({
        password: hashedPassword,
      })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      });

    return {
      message: `Password successfully updated for ${updatedUser.name}`,
      user: updatedUser,
    };
  }

  // Update a staff member's email
  async adminUpdateUserEmail(dto: { userId: string; email: string }) {
    const { userId, email } = dto;

    if (!email || !email.trim()) {
      throw new BadRequestException('Email address is required.');
    }

    // FIX: Changed 'tables.users' to 'schema.users'
    const [userExists] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!userExists) {
      throw new NotFoundException('User account not found.');
    }

    // FIX: Changed 'tables.users' to 'schema.users'
    const [updatedUser] = await this.db
      .update(schema.users)
      .set({
        email: email.trim(),
      })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      });

    return {
      message: `Email successfully updated for ${updatedUser.name}`,
      user: updatedUser,
    };
  }
}
