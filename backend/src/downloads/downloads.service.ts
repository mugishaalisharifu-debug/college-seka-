import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DownloadsService {
  private readonly bucket = 'downloads';
  private readonly folder = 'documents';

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async uploadDocument(
    body: {
      title: string;
      description?: string;
      category?: string;
      downloadUrl?: string;
    },
    file: Express.Multer.File,
  ) {
    if (!body.title?.trim()) {
      throw new BadRequestException('Document title is required');
    }

    if (!file) {
      throw new BadRequestException('Please attach a document file');
    }

    const uploaded = await this.supabaseService.uploadFile(
      file,
      this.bucket,
      this.folder,
    );

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileSize =
      file.size > 1024 * 1024
        ? `${sizeInMB} MB`
        : `${Math.round(file.size / 1024)} KB`;
    const fileFormat =
      file.originalname.split('.').pop()?.toUpperCase() || 'FILE';

    const validCategories = [
      'General',
      'Admissions',
      'Academic',
      'Fees',
      'Requirements',
    ];
    const category =
      body.category && validCategories.includes(body.category)
        ? (body.category as any)
        : 'General';

    const [item] = await this.db
      .insert(schema.downloads)
      .values({
        title: body.title.trim(),
        description:
          body.description?.trim() || 'Official institutional document.',
        category,
        fileSize,
        fileFormat,
        downloadUrl: uploaded.publicUrl,
        filePath: uploaded.filePath,
      })
      .returning();

    return {
      message: 'Document uploaded successfully',
      document: item,
    };
  }

  async deleteDocument(idOrPath: string) {
    // Check if UUID
    const [existing] = await this.db
      .select()
      .from(schema.downloads)
      .where(eq(schema.downloads.id, idOrPath));

    if (existing) {
      if (existing.filePath) {
        await this.supabaseService.deleteFile(this.bucket, existing.filePath);
      }
      await this.db
        .delete(schema.downloads)
        .where(eq(schema.downloads.id, idOrPath));
      return { message: 'Document deleted successfully' };
    }

    // Fallback: Delete file from Supabase storage by path
    await this.supabaseService.deleteFile(this.bucket, idOrPath);
    return { message: 'Document deleted successfully' };
  }
}
