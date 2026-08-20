import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { RequirementsService } from './requirements.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Controller('requirements')
@Roles('School-receptionist')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Get('master')
  async getMasterItems() {
    return await this.requirementsService.getMasterItems();
  }

  @Get('classes')
  async getAllClasses() {
    return await this.requirementsService.getAllClasses();
  }

  @Post('master')
  @HttpCode(HttpStatus.CREATED)
  async createMasterItem(
    @Body()
    dto: {
      name: string;
      category: 'Boarding / Tools' | 'Academic Supplies' | 'Personal Care / Fees';
      scope?: any;
      classId?: string;
      academicYear: string;
      description?: string;
    }
  ) {
    return await this.requirementsService.createMasterItem(dto);
  }

  @Delete('master/:id')
  async deleteMasterItem(@Param('id') id: string) {
    return await this.requirementsService.deleteMasterItem(id);
  }

  @Get('checkin-directory')
  async getCheckInDirectory() {
    return await this.requirementsService.getCheckInDirectory();
  }

  @Post('clearance/:studentId')
  async saveStudentClearance(
    @Param('studentId') studentId: string,
    @Body()
    dto: {
      broughtItemIds: string[];
      notes?: string;
      academicYear: string;
      term: 'TERM_1' | 'TERM_2' | 'TERM_3';
    },
    @Req() req: any
  ) {
    const inspectorId = req.user?.id;
    if (!inspectorId) {
      throw new UnauthorizedException('Invalid user session.');
    }
    return await this.requirementsService.saveStudentClearance(
      studentId,
      dto,
      inspectorId
    );
  }

  @Get('store-inventory')
  async getStoreInventory() {
    return await this.requirementsService.getStoreInventory();
  }

  @Post('store-inventory/issue')
  async issueStoreItem(
    @Body()
    dto: {
      storeItemId: string;
      quantity: number;
      issuedTo: string;
      notes?: string;
    },
    @Req() req: any
  ) {
    const recordedBy = req.user?.id;
    if (!recordedBy) {
      throw new UnauthorizedException('Invalid user session.');
    }
    return await this.requirementsService.issueStoreItem({
      ...dto,
      recordedBy,
    });
  }
}