import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import * as schema from '../db/schema'; 
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { applications, applicationDocuments } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>, // Typing now reads schema tables properly
  ) {}

  private generateReferenceCode(lastName: string): string {
    const initials = (lastName.trim().slice(0, 2) || 'ST').toUpperCase();
    const serial = Math.floor(1000 + Math.random() * 9000);
    return `CFSG-2026-${initials}${serial}`;
  }
  async submitApplication(data: any, files: Array<Express.Multer.File>) {
  const referenceCode = this.generateReferenceCode(data.lastName || 'ST');

  const [newApp] = await this.db
    .insert(applications)
    .values({
      referenceCode,
      studentFirstName: data.firstName,
      studentLastName: data.lastName,
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
      educationLevel: data.educationLevel,
      tradeName: data.tradeName || null,
      appliedClass: data.appliedClass,
      previousSchool: data.previousSchool || null,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail || null,
      residentialDescription: data.residentialDescription,
      relationShipToStudent: data.relationship,
      status: 'PENDING',
    })
    .returning();

  if (files && files.length > 0) {
    const documentRecords: any = [];

    for (const file of files) {
      const documentType = file.fieldname || 'document';
      const { publicUrl, filePath } = await this.supabaseService.uploadFile(
        file,
        process.env.SUPABASE_APPLICATIONS_BUCKET || 'students-documents',
        newApp.id,
      );

      documentRecords.push({
        applicationId: newApp.id,
        documentType,
        fileUrl: publicUrl,
        fileName: filePath,
      });
    }

    await this.db.insert(applicationDocuments).values(documentRecords);
  }

  return {
    message: 'Application submitted successfully',
    referenceCode: newApp.referenceCode,
    applicationId: newApp.id,
  };
}
  async findAll(userScope: string, status?: string, level?: string) {
    const filters: any = [];

    if (userScope && userScope !== 'All') {
      filters.push(eq(applications.educationLevel, userScope as any));
    } else if (level) {
      filters.push(eq(applications.educationLevel, level as any));
    }

    if (status) {
      filters.push(eq(applications.status, status as any));
    }

    if (filters.length > 0) {
      return await this.db
        .select()
        .from(applications)
        .where(and(...filters));
    }

    return await this.db.select().from(applications);
  }

  async findOne(id: string, userScope: string) {
    const [app] = await this.db
      .select()
      .from(applications)
      .where(eq(applications.id, id));

    if (!app) {
      throw new NotFoundException(`Application not found`);
    }

    if (userScope !== 'All' && app.educationLevel !== userScope) {
      throw new NotFoundException(`Application not found for your assigned scope`);
    }

    const docs = await this.db
      .select()
      .from(applicationDocuments)
      .where(eq(applicationDocuments.applicationId, id));

    return {
      ...app,
      documents: docs,
    };
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', userScope: string) {
    await this.findOne(id, userScope);

    const [updated] = await this.db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();

    return {
      message: `Application status updated to ${status}`,
      application: updated,
    };
  }

  async deleteApplication(id: string, userScope: string) {
    await this.findOne(id, userScope);

    await this.db
      .delete(applicationDocuments)
      .where(eq(applicationDocuments.applicationId, id));

    await this.db
      .delete(applications)
      .where(eq(applications.id, id));

    return {
      message: 'Application deleted successfully.',
      applicationId: id,
    };
  }
}
