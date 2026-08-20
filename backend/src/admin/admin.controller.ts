import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtGuard } from 'common/guards/auth.guard';
import { RoleGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // --- NEWS & ANNOUNCEMENTS ENDPOINTS -------
  // ==========================================

  @Get('public/news')
  async getPublishedNewsForPublic() {
    return await this.adminService.getPublishedNewsForPublic();
  }

  @Get('public/news/:slug')
  async getNewsBySlug(@Param('slug') slug: string) {
    return await this.adminService.getNewsBySlug(slug);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Get('news')
  async getAllNewsForAdmin() {
    return await this.adminService.getAllNewsForAdmin();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('news')
  @HttpCode(HttpStatus.CREATED)
  async createNews(
    @Body()
    dto: {
      title: string;
      slug: string;
      summary: string;
      content?: string;
      category: 'General' | 'Admissions' | 'Facilities' | 'Events';
      status?: 'Published' | 'Draft';
    },
    @Req() req: any,
  ) {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new UnauthorizedException('Invalid user session.');
    }
    return await this.adminService.createNews(dto, authorId);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Put('news/:id')
  async updateNews(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      slug?: string;
      summary?: string;
      content?: string;
      category?: 'General' | 'Admissions' | 'Facilities' | 'Events';
      status?: 'Published' | 'Draft';
    },
  ) {
    return await this.adminService.updateNews(id, dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Patch('news/:id/toggle-status')
  async toggleNewsStatus(@Param('id') id: string) {
    return await this.adminService.toggleNewsStatus(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Delete('news/:id')
  async deleteNews(@Param('id') id: string) {
    return await this.adminService.deleteNews(id);
  }

  // ==========================================
  // --- GALLERY ENDPOINTS --------------------
  // ==========================================

  @Get('public/gallery')
  async getPublishedGalleryItems() {
    return await this.adminService.getPublishedGalleryItems();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Get('gallery')
  async getAllGalleryItemsForAdmin() {
    return await this.adminService.getAllGalleryItemsForAdmin();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('gallery')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createGalleryItem(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    dto: {
      title: string;
      category: 'campus' | 'academics' | 'tvet' | 'sports' | 'events';
      date: string;
      imageUrl?: string;
    },
  ) {
    return await this.adminService.createGalleryItem(file, dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Patch('gallery/:id/toggle-publish')
  async toggleGalleryPublishStatus(@Param('id') id: string) {
    return await this.adminService.toggleGalleryPublishStatus(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Delete('gallery/:id')
  async deleteGalleryItem(@Param('id') id: string) {
    return await this.adminService.deleteGalleryItem(id);
  }

  // ==========================================
  // --- DOWNLOADS / RESOURCES ENDPOINTS ------
  // ==========================================

  @Get('public/downloads')
  async getAllDownloadsForPublic() {
    return await this.adminService.getAllDownloads();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Get('downloads')
  async getAllDownloads() {
    return await this.adminService.getAllDownloads();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('downloads')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createDownloadItem(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    dto: {
      title: string;
      description?: string;
      category: 'General' | 'Admissions' | 'Academic' | 'Fees' | 'Requirements';
      fileFormat?: string;
      downloadUrl?: string;
    },
  ) {
    return await this.adminService.createDownloadItem(file, dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Delete('downloads/:id')
  async deleteDownloadItem(@Param('id') id: string) {
    return await this.adminService.deleteDownloadItem(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Patch('downloads/:id')
  async updateDownloadItem(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      description?: string;
      category?:
        'General' | 'Admissions' | 'Academic' | 'Fees' | 'Requirements';
      fileFormat?: string;
      downloadUrl?: string;
    },
  ) {
    return await this.adminService.updateDownloadItem(id, dto);
  }

  // ==========================================
  // --- CONTACT & MESSAGES ENDPOINTS ---------
  // ==========================================

  @Post('public/contact')
  @HttpCode(HttpStatus.CREATED)
  async createContactMessage(
    @Body()
    dto: {
      sender: string;
      email: string;
      phone?: string;
      category?:
        | 'Admissions Inquiry'
        | 'School Fees Question'
        | 'Academic Programs & Support'
        | 'Schedule Visit'
        | 'Other Inquiries';
      subject: string;
      message: string;
    },
  ) {
    return await this.adminService.createContactMessage(dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Get('contact-messages')
  async getAllContactMessages() {
    return await this.adminService.getAllContactMessages();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Get('contact-messages/:id')
  async getContactMessageById(@Param('id') id: string) {
    return await this.adminService.getContactMessageById(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('contact-messages/:id/reply')
  async replyToContactMessage(
    @Param('id') id: string,
    @Body() dto: { replySubject?: string; replyMessage: string },
  ) {
    return await this.adminService.replyToContactMessage(id, dto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Patch('contact-messages/:id/status')
  async updateContactMessageStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'New' | 'Pending' | 'Reviewed' | 'Responded' },
  ) {
    return await this.adminService.updateContactMessageStatus(id, dto.status);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Delete('contact-messages/:id')
  async deleteContactMessage(@Param('id') id: string) {
    return await this.adminService.deleteContactMessage(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('Admin')
  @Post('reset-starter-data')
  @HttpCode(HttpStatus.OK)
  async resetStarterData() {
    return await this.adminService.resetStarterData();
  }
}
