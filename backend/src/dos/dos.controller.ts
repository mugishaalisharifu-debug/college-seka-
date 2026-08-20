import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Delete,
  Patch,
  Param,
} from '@nestjs/common';
import { Roles } from 'common/decorators/role.decorator';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { DosService } from './dos.service';

@UseGuards(JwtGuard, RoleGuard)
@Controller('dos')
export class DosController {
  constructor(private readonly dosService: DosService) {}

  //===========================================================================
  // 1. CLASS MANAGEMENT
  //===========================================================================

  @Post('classes')
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster')
  async registerClass(@Body() registerClassDto: any, @Req() req: any) {
    return await this.dosService.registerClass(registerClassDto, req.user);
  }
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster', 'Secondary-HeadMaster', 'Bursar', "School-receptionist",
  "Store-Manager", 'Cashier')
  @Get('classes')
  async getClassesByScope(@Req() req: any) {
    return await this.dosService.getClassesByScope(req.user);
  }

  @Delete('classes/:id')
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster')
  async deleteClass(@Param('id') classId: string, @Req() req: any) {
    return await this.dosService.deleteClass(classId, req.user);
  }

  @Patch('classes/:id')
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster')
  async updateClass(
    @Param('id') classId: string,
    @Body() updateDto: any,
    @Req() req: any,
  ) {
    return await this.dosService.updateClass(classId, updateDto, req.user);
  }


  //===========================================================================
  // 3. STUDENT RECORDS
  //===========================================================================

  @Post('students')
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster')
  async registerStudentDirectly(@Body() registerDto: any, @Req() req: any) {
    return await this.dosService.registerStudentDirectly(registerDto, req.user);
  }

  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster', 'Secondary-HeadMaster', 'Bursar', 'Store-Manager', 'School-receptionist')
  @Get('students')
  async getStudents(@Req() req: any) {
    return await this.dosService.getStudents(req.user);
  }

  @Patch('students/:id')
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster')
  async updateStudent(
    @Param('id') studentId: string,
    @Body() updateDto: any,
    @Req() req: any,
  ) {
    return await this.dosService.updateStudent(studentId, updateDto, req.user);
  }

  @Delete('students/:id')
  @Roles('DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster')
  async deleteStudent(@Param('id') studentId: string, @Req() req: any) {
    return await this.dosService.deleteStudents(studentId, req.user);
  }
}