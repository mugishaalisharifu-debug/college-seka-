import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { applications, applicationDocuments } from '../db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { SupabaseService } from '../supabase/supabase.service';

// Normalize a free-form gender value (e.g. 'male', 'MALE', ' Female ')
// into one of the exact Postgres enum values: 'Male' | 'Female'.
// Rejects missing / unrecognized values because the DB column is NOT NULL.
function requireGender(value: string | null | undefined): 'Male' | 'Female' {
  if (!value) {
    throw new BadRequestException('Gender is required.');
  }
  const lower = value.trim().toLowerCase();
  if (lower === 'male') return 'Male';
  if (lower === 'female') return 'Female';
  throw new BadRequestException(
    `Invalid gender value: "${value}". Expected "Male" or "Female".`,
  );
}

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
  private educationLevelsForUser(user: {
    role?: string;
    scope?: string;
  }): string[] | null {
    if (user.role === 'Primary-HeadMaster') return ['PRIMARY', 'NURSERY'];
    if (user.role === 'Secondary-HeadMaster')
      return ['LOWER SECONDARY', 'TVET'];
    if (user.role === 'DOS-Secondary') return ['LOWER SECONDARY'];
    if (user.role === 'DOS-Tvet') return ['TVET'];
    if (user.scope && user.scope !== 'All') return [user.scope];
    return null;
  }

  private normalizePhone(phone: string): string {
    return (phone || '').replace(/\D/g, '').replace(/^250/, '');
  }

  async submitApplication(data: any, files: Array<Express.Multer.File>) {
    const relationship =
      data.relationship === 'Other' ? 'Other Relative' : data.relationship;
    const referenceCode = this.generateReferenceCode(data.lastName || 'ST');

    const [newApp] = await this.db
      .insert(applications)
      .values({
        referenceCode,
        studentFirstName: data.firstName,
        studentLastName: data.lastName,
        gender: requireGender(data.gender),
        dateOfBirth: new Date(data.dateOfBirth),
        educationLevel: data.educationLevel,
        tradeName: data.tradeName || null,
        appliedClass: data.appliedClass,
        previousSchool: data.previousSchool || null,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || null,
        residentialDescription: data.residentialDescription,
        relationShipToStudent: relationship,
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
  async findAll(
    user: { role?: string; scope?: string },
    status?: string,
    level?: string,
  ) {
    const filters: any = [];
    const scopedLevels = this.educationLevelsForUser(user);

    if (scopedLevels) {
      filters.push(inArray(applications.educationLevel, scopedLevels as any));
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

  async findOne(id: string, user: { role?: string; scope?: string }) {
    const [app] = await this.db
      .select()
      .from(applications)
      .where(eq(applications.id, id));

    if (!app) {
      throw new NotFoundException(`Application not found`);
    }

    const scopedLevels = this.educationLevelsForUser(user);
    if (scopedLevels && !scopedLevels.includes(app.educationLevel)) {
      throw new NotFoundException(
        `Application not found for your assigned scope`,
      );
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

  async listAdmittedPublic() {
    const rows = await this.db
      .select({
        id: applications.id,
        name: sql<string>`${applications.studentFirstName} || ' ' || ${applications.studentLastName}`,
        educationLevel: applications.educationLevel,
        appliedClass: applications.appliedClass,
        tradeName: applications.tradeName,
      })
      .from(applications)
      .where(eq(applications.status, 'APPROVED'));

    return rows.map((row, index) => ({
      id: index + 1,
      name: row.name,
      level: row.educationLevel,
      assignedClass: row.tradeName
        ? `${row.appliedClass} — ${row.tradeName}`
        : row.appliedClass,
    }));
  }

  async lookupPublic(referenceCode: string, phone: string) {
    const code = (referenceCode || '').trim().toUpperCase();
    const digits = this.normalizePhone(phone);

    const [app] = await this.db
      .select()
      .from(applications)
      .where(sql`upper(${applications.referenceCode}) = ${code}`);

    if (!app || this.normalizePhone(app.parentPhone) !== digits) {
      return null;
    }

    const statusMap = {
      APPROVED: 'Admitted',
      PENDING: 'Pending',
      REJECTED: 'Rejected',
    } as const;

    return {
      applicantName: `${app.studentFirstName} ${app.studentLastName}`,
      applicationCode: app.referenceCode,
      educationLevel: app.tradeName
        ? `${app.educationLevel} - ${app.tradeName}`
        : app.educationLevel,
      status: statusMap[app.status],
      assignedClass: app.appliedClass,
      note:
        app.status === 'APPROVED'
          ? 'Congratulations! Please report to the administration office with original documents within two weeks.'
          : app.status === 'REJECTED'
            ? 'This application was not successful. Contact admissions for more information.'
            : 'Your application is still under review.',
    };
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    user: { role?: string; scope?: string },
  ) {
    await this.findOne(id, user);

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

  async deleteApplication(id: string, user: { role?: string; scope?: string }) {
    await this.findOne(id, user);

    await this.db
      .delete(applicationDocuments)
      .where(eq(applicationDocuments.applicationId, id));

    await this.db.delete(applications).where(eq(applications.id, id));

    return {
      message: 'Application deleted successfully.',
      applicationId: id,
    };
  }
}
