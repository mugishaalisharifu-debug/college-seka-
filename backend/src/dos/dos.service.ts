import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as schema from '../db/schema';
import { DRIZZLE } from '../db/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class DosService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  //----------------- CLASSES -----------------//

  async registerClass(registerClassDto: any, user: any) {
    const { className, scope, tradeName } = registerClassDto;

    if (user.role === 'DOS-Secondary' && scope !== 'LOWER SECONDARY') {
      throw new ForbiddenException(
        'DOS-Secondary can only create Lower Secondary classes.',
      );
    }
    if (user.role === 'DOS-Tvet' && scope !== 'TVET') {
      throw new ForbiddenException(
        'DOS-Tvet can only create TVET trade classes.',
      );
    }
    if (
      user.role === 'Primary-HeadMaster' &&
      scope !== 'PRIMARY' &&
      scope !== 'NURSERY'
    ) {
      throw new ForbiddenException(
        'Primary Headmaster can only create primary and nursery classes.',
      );
    }

    const [newClass] = await this.db
      .insert(schema.classes)
      .values({
        className,
        scope,
        tradeName: scope === 'TVET' ? tradeName : null,
      })
      .returning();

    return {
      message: 'Class registered successfully',
      data: newClass,
    };
  }

  async getClassesByScope(user: any) {
    if (user.role === 'Primary-HeadMaster') {
      return await this.db
        .select()
        .from(schema.classes)
        .where(inArray(schema.classes.scope, ['PRIMARY', 'NURSERY']));
    }

    if (user.role === 'Secondary-HeadMaster') {
      return await this.db
        .select()
        .from(schema.classes)
        .where(inArray(schema.classes.scope, ['LOWER SECONDARY', 'TVET']));
    }

    if (user.role === 'DOS-Secondary') {
      return await this.db
        .select()
        .from(schema.classes)
        .where(eq(schema.classes.scope, 'LOWER SECONDARY'));
    }

    if (user.role === 'DOS-Tvet') {
      return await this.db
        .select()
        .from(schema.classes)
        .where(eq(schema.classes.scope, 'TVET'));
    }

    if (!user.scope || user.scope.toUpperCase() === 'ALL') {
      return await this.db.select().from(schema.classes);
    }

    return await this.db
      .select()
      .from(schema.classes)
      .where(eq(schema.classes.scope, user.scope));
  }

  async deleteClass(classId: string, user: any) {
    const allowedRoles = ['DOS-Secondary', 'DOS-Tvet', 'Primary-HeadMaster'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Only DOS users or Primary Headmasters can remove classes.',
      );
    }

    const [classToDelete] = await this.db
      .select()
      .from(schema.classes)
      .where(eq(schema.classes.id, classId));

    if (!classToDelete) {
      throw new NotFoundException(`Class with ID ${classId} not found.`);
    }

    if (user.role === 'Primary-HeadMaster') {
      if (
        classToDelete.scope !== 'PRIMARY' &&
        classToDelete.scope !== 'NURSERY'
      ) {
        throw new ForbiddenException(
          'Primary Headmaster can only delete Primary or Nursery classes.',
        );
      }
    } else if (user.scope !== classToDelete.scope) {
      throw new ForbiddenException(
        `Only DOS for ${classToDelete.scope} can delete classes in this section.`,
      );
    }

    await this.db
      .delete(schema.classes)
      .where(eq(schema.classes.id, classId));

    return {
      message: 'Class deleted successfully',
      deletedId: classId,
    };
  }

  async updateClass(classId: string, updateDto: any, user: any) {
    const allowedRoles = ['DOS-Secondary', 'DOS-Tvet', 'Primary-HeadMaster'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Only DOS users or Primary Headmasters can update classes.',
      );
    }

    const [existingClass] = await this.db
      .select()
      .from(schema.classes)
      .where(eq(schema.classes.id, classId));

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${classId} not found.`);
    }

    if (user.role === 'Primary-HeadMaster') {
      if (
        existingClass.scope !== 'PRIMARY' &&
        existingClass.scope !== 'NURSERY'
      ) {
        throw new ForbiddenException(
          'Primary Headmaster can only update Primary or Nursery classes.',
        );
      }
    } else if (user.scope !== existingClass.scope) {
      throw new ForbiddenException(
        `Only DOS for ${existingClass.scope} can update classes in this section.`,
      );
    }

    const { className, scope, tradeName } = updateDto;
    const targetScope = scope || existingClass.scope;

    if (user.role === 'DOS-Secondary' && targetScope !== 'LOWER SECONDARY') {
      throw new ForbiddenException(
        'DOS-Secondary can only manage Lower Secondary classes.',
      );
    }
    if (user.role === 'DOS-Tvet' && targetScope !== 'TVET') {
      throw new ForbiddenException('DOS-Tvet can only manage TVET classes.');
    }
    if (
      user.role === 'Primary-HeadMaster' &&
      targetScope !== 'PRIMARY' &&
      targetScope !== 'NURSERY'
    ) {
      throw new ForbiddenException(
        'Primary Headmaster can only manage Primary or Nursery classes.',
      );
    }

    const [updatedClass] = await this.db
      .update(schema.classes)
      .set({
        ...(className && { className }),
        ...(scope && { scope }),
        ...(tradeName !== undefined && {
          tradeName: targetScope === 'TVET' ? tradeName : null,
        }),
      })
      .where(eq(schema.classes.id, classId))
      .returning();

    return {
      message: 'Class updated successfully',
      data: updatedClass,
    };
  }

  //----------------- STUDENTS RECORDS -----------------//

  async registerStudentDirectly(registerDto: any, user: any) {
    const {
      studentName,
      gender,
      dateOfBirth,
      educationLevel,
      tradeName,
      classId,
      parentName,
      parentPhone,
      studentType,
      isNewStudent,
      status,
    } = registerDto;

    // Authorization checks by role and scope
    if (user.role === 'DOS-Secondary' && educationLevel !== 'LOWER SECONDARY') {
      throw new ForbiddenException(
        'DOS-Secondary can only register Lower Secondary students.',
      );
    }
    if (user.role === 'DOS-Tvet' && educationLevel !== 'TVET') {
      throw new ForbiddenException('DOS-Tvet can only register TVET students.');
    }
    if (
      user.role === 'Primary-HeadMaster' &&
      educationLevel !== 'PRIMARY' &&
      educationLevel !== 'NURSERY'
    ) {
      throw new ForbiddenException(
        'Primary Headmaster can only register Primary and Nursery students.',
      );
    }

    // Determine default studentType if not provided
    let finalStudentType = studentType;
    if (!finalStudentType) {
      if (educationLevel === 'PRIMARY' || educationLevel === 'NURSERY') {
        finalStudentType = 'DAY';
      } else if (
        educationLevel === 'LOWER SECONDARY' ||
        educationLevel === 'TVET'
      ) {
        finalStudentType = 'BOARDING';
      }
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `STU-${new Date().getFullYear()}-${randomCode}`;

    const [newStudent] = await this.db
      .insert(schema.students)
      .values({
        regNumber,
        studentName,
        gender: gender ? gender : null,
        dateOfBirth: new Date(dateOfBirth),
        educationLevel,
        tradeName: educationLevel === 'TVET' ? tradeName : null,
        classId,
        parentName,
        parentPhone,
        studentType: finalStudentType,
        ...(isNewStudent !== undefined && { isNewStudent }),
        ...(status && { status }),
      })
      .returning();

    return {
      message: 'Student registered and enrolled successfully',
      data: newStudent,
    };
  }

  async getStudents(user: any) {
    if (user.role === 'Primary-HeadMaster') {
      return await this.db
        .select()
        .from(schema.students)
        .where(inArray(schema.students.educationLevel, ['PRIMARY', 'NURSERY']));
    }

    if (user.role === 'Secondary-HeadMaster') {
      return await this.db
        .select()
        .from(schema.students)
        .where(inArray(schema.students.educationLevel, ['LOWER SECONDARY', 'TVET']));
    }

    if (user.role === 'DOS-Secondary') {
      return await this.db
        .select()
        .from(schema.students)
        .where(eq(schema.students.educationLevel, 'LOWER SECONDARY'));
    }

    if (user.role === 'DOS-Tvet') {
      return await this.db
        .select()
        .from(schema.students)
        .where(eq(schema.students.educationLevel, 'TVET'));
    }

    if (!user.scope || user.scope.toUpperCase() === 'ALL') {
      return await this.db.select().from(schema.students);
    }

    return await this.db
      .select()
      .from(schema.students)
      .where(eq(schema.students.educationLevel, user.scope));
  }

  async deleteStudents(studentId: string, user: any) {
    const allowedRoles = ['DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Only DOS users or Primary Headmasters can delete student records.',
      );
    }

    const [studentToDelete] = await this.db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));

    if (!studentToDelete) {
      throw new NotFoundException(`Student with ID ${studentId} not found.`);
    }

    if (user.role === 'Primary-HeadMaster') {
      if (
        studentToDelete.educationLevel !== 'PRIMARY' &&
        studentToDelete.educationLevel !== 'NURSERY'
      ) {
        throw new ForbiddenException(
          'Primary Headmaster can only delete Primary or Nursery students.',
        );
      }
    } else if (user.scope !== studentToDelete.educationLevel) {
      throw new ForbiddenException(
        `You are not authorized to delete students in ${studentToDelete.educationLevel}.`,
      );
    }

    await this.db
      .delete(schema.students)
      .where(eq(schema.students.id, studentId));

    return {
      message: 'Student record deleted successfully',
      deletedId: studentId,
    };
  }

  async updateStudent(studentId: string, updateDto: any, user: any) {
    const allowedRoles = ['DOS-Tvet', 'DOS-Secondary', 'Primary-HeadMaster'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Only DOS users or Primary Headmasters can update student records.',
      );
    }

    const [existingStudent] = await this.db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${studentId} not found.`);
    }

    if (user.role === 'Primary-HeadMaster') {
      if (
        existingStudent.educationLevel !== 'PRIMARY' &&
        existingStudent.educationLevel !== 'NURSERY'
      ) {
        throw new ForbiddenException(
          'Primary Headmaster can only update Primary or Nursery students.',
        );
      }
    } else if (user.scope !== existingStudent.educationLevel) {
      throw new ForbiddenException(
        `You are not authorized to update students in ${existingStudent.educationLevel}.`,
      );
    }

    const {
      studentName,
      gender,
      dateOfBirth,
      educationLevel,
      tradeName,
      classId,
      parentName,
      parentPhone,
      studentType,
      isNewStudent,
      status,
    } = updateDto;

    const targetLevel = educationLevel || existingStudent.educationLevel;
    if (user.role === 'DOS-Secondary' && targetLevel !== 'LOWER SECONDARY') {
      throw new ForbiddenException(
        'DOS-Secondary can only manage Lower Secondary students.',
      );
    }
    if (user.role === 'DOS-Tvet' && targetLevel !== 'TVET') {
      throw new ForbiddenException('DOS-Tvet can only manage TVET students.');
    }
    if (
      user.role === 'Primary-HeadMaster' &&
      targetLevel !== 'PRIMARY' &&
      targetLevel !== 'NURSERY'
    ) {
      throw new ForbiddenException(
        'Primary Headmaster can only manage Primary or Nursery students.',
      );
    }

    const [updatedStudent] = await this.db
      .update(schema.students)
      .set({
        ...(studentName && { studentName }),
        ...(gender && { gender: gender.toLowerCase() }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(educationLevel && { educationLevel }),
        ...(tradeName !== undefined && {
          tradeName: targetLevel === 'TVET' ? tradeName : null,
        }),
        ...(classId !== undefined && { classId }),
        ...(parentName && { parentName }),
        ...(parentPhone && { parentPhone }),
        ...(studentType && { studentType }),
        ...(isNewStudent !== undefined && { isNewStudent }),
        ...(status && { status }),
      })
      .where(eq(schema.students.id, studentId))
      .returning();

    return {
      message: 'Student record updated successfully',
      data: updatedStudent,
    };
  }
}