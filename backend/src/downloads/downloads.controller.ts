import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { DownloadsService } from './downloads.service';

@Controller('admin/downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    body: {
      title: string;
      description?: string;
      category?: string;
      downloadUrl?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No document file was received');
    }

    return this.downloadsService.uploadDocument(body, file);
  }
}
