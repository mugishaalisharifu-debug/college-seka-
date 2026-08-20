import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private cloudinaryService: CloudinaryService,
    private supabaseService: SupabaseService,
    private emailService: EmailService,
  ) {}

  // --- NEWS & ANNOUNCEMENTS ---

  async getAllNewsForAdmin() {
    return await this.db
      .select()
      .from(schema.news)
      .orderBy(desc(schema.news.createdAt));
  }

  async getPublishedNewsForPublic() {
    return await this.db
      .select()
      .from(schema.news)
      .where(eq(schema.news.status, 'Published'))
      .orderBy(desc(schema.news.createdAt));
  }

  async getNewsBySlug(slug: string) {
    const [article] = await this.db
      .select()
      .from(schema.news)
      .where(eq(schema.news.slug, slug));

    if (!article) {
      throw new NotFoundException('News article not found.');
    }

    return article;
  }

  async createNews(
    dto: {
      title: string;
      slug: string;
      summary: string;
      content?: string;
      category: 'General' | 'Admissions' | 'Facilities' | 'Events';
      status?: 'Published' | 'Draft';
    },
    authorId: string,
  ) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Headline title is required.');
    }

    if (!dto.summary || !dto.summary.trim()) {
      throw new BadRequestException('Summary is required.');
    }

    const [existingSlug] = await this.db
      .select()
      .from(schema.news)
      .where(eq(schema.news.slug, dto.slug.trim()));

    if (existingSlug) {
      throw new BadRequestException(
        'An article with this URL slug already exists.',
      );
    }

    const [article] = await this.db
      .insert(schema.news)
      .values({
        title: dto.title.trim(),
        slug: dto.slug.trim(),
        summary: dto.summary.trim(),
        content: dto.content?.trim() || null,
        category: dto.category,
        status: dto.status || 'Published',
        authorId,
      })
      .returning();

    return article;
  }

  async updateNews(
    id: string,
    dto: {
      title?: string;
      slug?: string;
      summary?: string;
      content?: string;
      category?: 'General' | 'Admissions' | 'Facilities' | 'Events';
      status?: 'Published' | 'Draft';
    },
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.news)
      .where(eq(schema.news.id, id));

    if (!existing) {
      throw new NotFoundException('News article not found.');
    }

    const [updated] = await this.db
      .update(schema.news)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.news.id, id))
      .returning();

    return updated;
  }

  async toggleNewsStatus(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.news)
      .where(eq(schema.news.id, id));

    if (!existing) {
      throw new NotFoundException('News article not found.');
    }

    const nextStatus = existing.status === 'Published' ? 'Draft' : 'Published';

    const [updated] = await this.db
      .update(schema.news)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(schema.news.id, id))
      .returning();

    return updated;
  }

  async deleteNews(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.news)
      .where(eq(schema.news.id, id));

    if (!existing) {
      throw new NotFoundException('News article not found.');
    }

    await this.db.delete(schema.news).where(eq(schema.news.id, id));

    return { message: 'News article deleted successfully.' };
  }

  //------------ GALLERY -------------//

  async getPublishedGalleryItems() {
    return await this.db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.published, true))
      .orderBy(desc(schema.gallery.createdAt));
  }

  async getAllGalleryItemsForAdmin() {
    return await this.db
      .select()
      .from(schema.gallery)
      .orderBy(desc(schema.gallery.createdAt));
  }

  async createGalleryItem(
    file: Express.Multer.File | undefined,
    dto: {
      title: string;
      category: 'campus' | 'academics' | 'tvet' | 'sports' | 'events';
      date: string;
      imageUrl?: string;
    },
  ) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Photo title is required.');
    }

    if (!dto.category) {
      throw new BadRequestException('Gallery category is required.');
    }

    let finalImageUrl = dto.imageUrl?.trim();
    let publicId: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'campus_gallery',
      );
      finalImageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    if (!finalImageUrl) {
      throw new BadRequestException(
        'Please upload an image file or provide a valid image URL.',
      );
    }

    const [item] = await this.db
      .insert(schema.gallery)
      .values({
        title: dto.title.trim(),
        category: dto.category,
        imageUrl: finalImageUrl,
        publicId,
        date: dto.date || new Date().toISOString().split('T')[0],
        published: true,
      })
      .returning();

    return item;
  }

  async toggleGalleryPublishStatus(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.id, id));

    if (!existing) {
      throw new NotFoundException('Gallery photo not found.');
    }

    const [updated] = await this.db
      .update(schema.gallery)
      .set({
        published: !existing.published,
        updatedAt: new Date(),
      })
      .where(eq(schema.gallery.id, id))
      .returning();

    return updated;
  }

  async deleteGalleryItem(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.gallery)
      .where(eq(schema.gallery.id, id));

    if (!existing) {
      throw new NotFoundException('Gallery photo not found.');
    }

    if (existing.publicId) {
      await this.cloudinaryService.deleteImage(existing.publicId);
    }

    await this.db.delete(schema.gallery).where(eq(schema.gallery.id, id));

    return { message: 'Gallery photo deleted successfully.' };
  }

  // ======================
  // - DOWNLOADS / RESOURCES SERVICES
  // ======================

  async getAllDownloads() {
    return await this.db
      .select()
      .from(schema.downloads)
      .orderBy(desc(schema.downloads.createdAt));
  }

  async createDownloadItem(
    file: Express.Multer.File | undefined,
    dto: {
      title: string;
      description?: string;
      category: 'General' | 'Admissions' | 'Academic' | 'Fees' | 'Requirements';
      fileFormat?: string;
      downloadUrl?: string;
    },
  ) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Document title is required.');
    }

    let downloadUrl = dto.downloadUrl?.trim();
    let filePath: string | null = null;
    let fileSize = '1.2 MB';
    let fileFormat = dto.fileFormat?.toUpperCase() || 'PDF';

    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      fileSize =
        file.size > 1024 * 1024
          ? `${sizeInMB} MB`
          : `${Math.round(file.size / 1024)} KB`;
      fileFormat = file.originalname.split('.').pop()?.toUpperCase() || 'PDF';

      const uploadResult = await this.supabaseService.uploadFile(
        file,
        process.env.SUPABASE_STORAGE_BUCKET || 'documents',
        'resource_center',
      );
      downloadUrl = uploadResult.publicUrl;
      filePath = uploadResult.filePath;
    }

    if (!downloadUrl) {
      throw new BadRequestException(
        'Please attach a file or provide a download URL.',
      );
    }

    const [item] = await this.db
      .insert(schema.downloads)
      .values({
        title: dto.title.trim(),
        description:
          dto.description?.trim() || 'Official institutional document.',
        category: dto.category,
        fileSize,
        fileFormat,
        downloadUrl,
        filePath,
      })
      .returning();

    return item;
  }

  async updateDownloadItem(
    id: string,
    dto: {
      title?: string;
      description?: string;
      category?: 'General' | 'Admissions' | 'Academic' | 'Fees' | 'Requirements';
      fileFormat?: string;
      downloadUrl?: string;
    },
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.downloads)
      .where(eq(schema.downloads.id, id));

    if (!existing) {
      throw new NotFoundException('Document resource not found.');
    }

    const [updated] = await this.db
      .update(schema.downloads)
      .set({
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.fileFormat !== undefined && {
          fileFormat: dto.fileFormat.toUpperCase(),
        }),
        ...(dto.downloadUrl !== undefined && {
          downloadUrl: dto.downloadUrl.trim(),
        }),
        updatedAt: new Date(),
      })
      .where(eq(schema.downloads.id, id))
      .returning();

    return updated;
  }

  async deleteDownloadItem(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.downloads)
      .where(eq(schema.downloads.id, id));

    if (!existing) {
      throw new NotFoundException('Document resource not found.');
    }

    if (existing.filePath) {
      await this.supabaseService.deleteFile(
        process.env.SUPABASE_STORAGE_BUCKET || 'documents',
        existing.filePath,
      );
    }

    await this.db
      .delete(schema.downloads)
      .where(eq(schema.downloads.id, id));

    return { message: 'Document resource deleted successfully.' };
  }

  // ======================
  // - CONTACT & MESSAGES SERVICES
  // ======================
async getAllContactMessages() {
    return await this.db
      .select()
      .from(schema.contactMessages)
      .orderBy(desc(schema.contactMessages.createdAt));
  }

  async getContactMessageById(id: string) {
    const [message] = await this.db
      .select()
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.id, id));

    if (!message) {
      throw new NotFoundException('Contact message not found.');
    }

    return message;
  }

  async createContactMessage(dto: {
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
  }) {
    if (!dto.sender || !dto.sender.trim()) {
      throw new BadRequestException('Sender name is required.');
    }
    if (!dto.email || !dto.email.trim()) {
      throw new BadRequestException('Email address is required.');
    }
    if (!dto.subject || !dto.subject.trim()) {
      throw new BadRequestException('Subject is required.');
    }
    if (!dto.message || !dto.message.trim()) {
      throw new BadRequestException('Message content is required.');
    }

    const [newMessage] = await this.db
      .insert(schema.contactMessages)
      .values({
        sender: dto.sender.trim(),
        email: dto.email.trim(),
        phone: dto.phone?.trim() || null,
        category: dto.category || 'Other Inquiries',
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        status: 'New',
      })
      .returning();

    return newMessage;
  }

 async replyToContactMessage(
    id: string,
    dto: { replySubject?: string; replyMessage: string },
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.id, id));

    if (!existing) {
      throw new NotFoundException('Contact message not found.');
    }

    if (!dto.replyMessage || !dto.replyMessage.trim()) {
      throw new BadRequestException('Reply message body cannot be empty.');
    }

    const subject =
      dto.replySubject?.trim() || existing.subject || 'Your Inquiry';

    await this.emailService.sendReplyEmail(
      existing.email,
      existing.sender,
      subject,
      dto.replyMessage.trim(),
    );

    // Update status to 'Responded' in database
    const [updated] = await this.db
      .update(schema.contactMessages)
      .set({
        status: 'Responded',
        replyMessage: dto.replyMessage.trim(),
        repliedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.contactMessages.id, id))
      .returning();

    return {
      message: 'Reply sent successfully via email.',
      data: updated,
    };
  }

  async updateContactMessageStatus(
    id: string,
    status: 'New' | 'Pending' | 'Reviewed' | 'Responded',
  ) {
    const [existing] = await this.db
      .select()
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.id, id));

    if (!existing) {
      throw new NotFoundException('Contact message not found.');
    }

    const [updated] = await this.db
      .update(schema.contactMessages)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.contactMessages.id, id))
      .returning();

    return updated;
  }

  async deleteContactMessage(id: string) {
    const [existing] = await this.db
      .select()
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.id, id));

    if (!existing) {
      throw new NotFoundException('Contact message not found.');
    }

    await this.db
      .delete(schema.contactMessages)
      .where(eq(schema.contactMessages.id, id));

    return { message: 'Contact message deleted successfully.' };
  }
}