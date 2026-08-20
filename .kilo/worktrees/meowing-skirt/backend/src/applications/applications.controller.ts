import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async apply(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.applicationsService.submitApplication(body, files);
  }

  @Get('public/admitted')
  async listAdmittedPublic() {
    return await this.applicationsService.listAdmittedPublic();
  }

  @Get('public/status')
  async lookupPublic(
    @Query('referenceCode') referenceCode: string,
    @Query('phone') phone: string,
  ) {
    return await this.applicationsService.lookupPublic(referenceCode, phone);
  }

  @Get()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Primary-HeadMaster', 'Secondary-HeadMaster', 'DOS-Secondary', 'DOS-Tvet')
  async getAllApplications(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('level') level?: string,
  ) {
    return await this.applicationsService.findAll(req.user, status, level);
  }

  @Get(':id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Primary-HeadMaster', 'Secondary-HeadMaster', 'DOS-Secondary', 'DOS-Tvet')
  async getApplicationDetails(@Req() req: any, @Param('id') id: string) {
    return await this.applicationsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Primary-HeadMaster', 'Secondary-HeadMaster', 'DOS-Secondary', 'DOS-Tvet')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return await this.applicationsService.updateStatus(id, status, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Primary-HeadMaster', 'Secondary-HeadMaster', 'DOS-Secondary', 'DOS-Tvet')
  async deleteApplication(@Req() req: any, @Param('id') id: string) {
    return await this.applicationsService.deleteApplication(id, req.user);
  }
}