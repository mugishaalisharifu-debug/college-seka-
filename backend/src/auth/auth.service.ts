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

  // Create a new staff account
  async createStaffAccount(dto: {
    name: string;
    email: string;
    role: any;
    scope?: any;
    password?: string;
  }) {
    const { name, email, role, scope, password } = dto;
    if (!name || !email || !role) {
      throw new BadRequestException('Name, email, and role are required.');
    }

    const [existing] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.trim()));

    if (existing) {
      throw new BadRequestException('A user with this email already exists.');
    }

    const rawPassword =
      password && password.length >= 6 ? password : 'admin12345';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        name: name.trim(),
        email: email.trim(),
        role,
        scope: scope || 'All',
        password: hashedPassword,
      })
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        scope: schema.users.scope,
      });

    return newUser;
  }

  // Update a staff account details
  async updateStaffAccount(
    userId: string,
    dto: { name?: string; email?: string; role?: any; scope?: any },
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!existing) {
      throw new NotFoundException('User account not found.');
    }

    const [updatedUser] = await this.db
      .update(schema.users)
      .set({
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.email && { email: dto.email.trim() }),
        ...(dto.role && { role: dto.role }),
        ...(dto.scope && { scope: dto.scope }),
      })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        scope: schema.users.scope,
      });

    return updatedUser;
  }

  // Delete a staff account
  async deleteStaffAccount(userId: string) {
    const [existing] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!existing) {
      throw new NotFoundException('User account not found.');
    }

    await this.db.delete(schema.users).where(eq(schema.users.id, userId));
    return { message: `Account ${existing.email} deleted successfully.` };
  }
}
