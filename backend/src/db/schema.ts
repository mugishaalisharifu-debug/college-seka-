import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  boolean,
  decimal,
  varchar,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -----------------------
// -------ENUMS ---------///
//------------
export const roleEnum = pgEnum('user_role', [
  'Secondary-HeadMaster',
  'Primary-HeadMaster',
  'DOS-Secondary',
  'DOS-Tvet',
  'Admin',
  'Bursar',
  'Cashier',
  'School-receptionist',
  'Store-Manager',
]);

export const scopeEnum = pgEnum('section_scope', [
  'PRIMARY',
  'LOWER SECONDARY',
  'TVET',
  'NURSERY',
  'All',
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
]);

export const genderEnum = pgEnum('gender', ['Male', 'Female']);

export const relationShipEnum = pgEnum('relationship', [
  'Father',
  'Mother',
  'Guardian',
  'Other Relative',
]);

export const studentStatusEnum = pgEnum('student_status', [
  'ACTIVE',
  'TRANSFERRED',
  'GRADUATED',
  'SUSPENDED',
]);

export const studentTypeEnum = pgEnum('student_type', ['DAY', 'BOARDING']);

export const termEnum = pgEnum('term_enum', ['TERM_1', 'TERM_2', 'TERM_3']);

export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH',
  'BANK_TRANSFER',
  'MOBILE_MONEY',
  'CHEQUE',
]);

export const unitEnum = pgEnum('inventory_unit', ['kg', 'liters', 'bags']);

export const txTypeEnum = pgEnum('inventory_tx_type', [
  'STOCK_IN',
  'STOCK_OUT',
  'SPOILAGE',
]);

export const mealTypeEnum = pgEnum('inventory_meal_type', [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Special Event',
  'Other',
]);

export const spoilageReasonEnum = pgEnum('spoilage_reason', [
  'Water Damage / Rain',
  'Pest Infestation',
  'Expired',
  'Transportation / Bag Tear',
  'Other Spoilage',
]);

export const requirementCategoryEnum = pgEnum('requirement_category', [
  'Boarding / Tools',
  'Academic Supplies',
  'Personal Care / Fees',
]);

export const storeTxTypeEnum = pgEnum('store_tx_type', [
  'STUDENT_DEPOSIT',
  'ISSUED_OUT',
  'DISPOSED',
]);

export const newsCategoryEnum = pgEnum('news_category', [
  'General',
  'Admissions',
  'Facilities',
  'Events',
]);

export const newsStatusEnum = pgEnum('news_status', ['Published', 'Draft']);

export const galleryCategoryEnum = pgEnum('gallery_category', [
  'campus',
  'academics',
  'tvet',
  'sports',
  'events',
]);

export const downloadsCategoryEnum = pgEnum('downloads_category', [
  'General',
  'Admissions',
  'Academic',
  'Fees',
  'Requirements',
]);

export const contactMessageStatusEnum = pgEnum('contact_message_status', [
  'New',
  'Pending',
  'Reviewed',
  'Responded',
]);

export const contactMessageCategoryEnum = pgEnum('contact_message_category', [
  'Admissions Inquiry',
  'School Fees Question',
  'Academic Programs & Support',
  'Schedule Visit',
  'Other Inquiries',
]);
// -----------------------
// -------TABLES ---------///
//------------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull(),
  scope: scopeEnum('scope').notNull().default('All'),
});

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  className: text('class_name').notNull(),
  scope: scopeEnum('scope').notNull(),
  tradeName: text('trade_name'),
});

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  referenceCode: text('reference_code').unique().notNull(),
  studentFirstName: text('student_first_name').notNull(),
  studentLastName: text('student_last_name').notNull(),
  gender: genderEnum('gender').notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  educationLevel: scopeEnum('education_level').notNull(),
  tradeName: text('trade_name'),
  appliedClass: text('applied_class').notNull(),
  previousSchool: text('previous_school'),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  parentEmail: text('parent_email'),
  residentialDescription: text('residential_description').notNull(),
  relationShipToStudent: relationShipEnum('relationship_to_student').notNull(),
  studentType: studentTypeEnum('student_type').default('DAY').notNull(),
  status: applicationStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const applicationDocuments = pgTable('application_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id')
    .references(() => applications.id, { onDelete: 'cascade' })
    .notNull(),
  documentType: text('document_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  regNumber: text('reg_number').unique().notNull(),
  studentName: text('student_name').notNull(),
  gender: genderEnum('gender').notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  educationLevel: scopeEnum('education_level').notNull(),
  tradeName: text('trade_name'),
  classId: uuid('class_id').references(() => classes.id),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  studentType: studentTypeEnum('student_type').default('DAY').notNull(),
  isNewStudent: boolean('is_new_student').default(true).notNull(),
  status: studentStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const feeStructures = pgTable('fee_structures', {
  id: uuid('id').primaryKey().defaultRandom(),
  academicYear: text('academic_year').notNull(),
  term: termEnum('term').notNull(),
  scope: scopeEnum('scope').notNull(),
  tradeName: text('trade_name'),
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  isMandatory: boolean('is_mandatory').default(true).notNull(),
  isBoardingOnly: boolean('is_boarding_only').default(false).notNull(),
  isDayOnly: boolean('is_day_only').default(false).notNull(),
  isNewStudentOnly: boolean('is_new_student_only').default(false).notNull(),
  customReason: text('custom_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  receiptNo: text('receipt_no').unique().notNull(),
  studentId: uuid('student_id')
    .references(() => students.id)
    .notNull(),
  amountPaid: decimal('amount_paid', { precision: 12, scale: 2 }).notNull(),
  academicPeriod: text('academic_period').notNull(),
  remarks: text('remarks'),
  recordedBy: uuid('recorded_by')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  unit: unitEnum('unit').notNull().default('kg'),
  availableQuantity: numeric('available_quantity', { precision: 12, scale: 2 })
    .notNull()
    .default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id')
    .references(() => inventoryItems.id)
    .notNull(),
  type: txTypeEnum('type').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  supplier: varchar('supplier', { length: 150 }),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  dateReceived: varchar('date_received', { length: 20 }),
  mealType: mealTypeEnum('meal_type'),
  issuedTo: varchar('issued_to', { length: 150 }),
  dateIssued: varchar('date_issued', { length: 20 }),
  timeIssued: varchar('time_issued', { length: 20 }),
  spoilageReason: spoilageReasonEnum('spoilage_reason'),
  dateReported: varchar('date_reported', { length: 20 }),
  timeReported: varchar('time_reported', { length: 20 }),
  recordedBy: uuid('recorded_by')
    .references(() => users.id)
    .notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const requirementItems = pgTable('requirement_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: requirementCategoryEnum('category').notNull(),
  scope: scopeEnum('scope').notNull().default('All'),
  classId: uuid('class_id').references(() => classes.id),
  academicYear: text('academic_year').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const studentRequirementChecks = pgTable('student_requirement_checks', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id)
    .notNull(),
  requirementItemId: uuid('requirement_item_id')
    .references(() => requirementItems.id)
    .notNull(),
  isBrought: boolean('is_brought').default(false).notNull(),
  inspectedBy: uuid('inspected_by')
    .references(() => users.id)
    .notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const studentRequirementNotes = pgTable('student_requirement_notes', {
  studentId: uuid('student_id')
    .references(() => students.id)
    .primaryKey(),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const storeItems = pgTable('store_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  category: requirementCategoryEnum('category').notNull(),
  availableQuantity: numeric('available_quantity', { precision: 12, scale: 2 })
    .notNull()
    .default('0'),
  unit: varchar('unit', { length: 50 }).notNull().default('pcs'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const studentStoreDeposits = pgTable('student_store_deposits', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id)
    .notNull(),
  storeItemId: uuid('store_item_id')
    .references(() => storeItems.id)
    .notNull(),
  requirementItemId: uuid('requirement_item_id').references(
    () => requirementItems.id,
  ),
  quantityBrought: numeric('quantity_brought', { precision: 12, scale: 2 })
    .notNull()
    .default('1'),
  receivedBy: uuid('received_by')
    .references(() => users.id)
    .notNull(),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  term: termEnum('term').notNull(),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
});

export const storeTransactions = pgTable('store_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeItemId: uuid('store_item_id')
    .references(() => storeItems.id)
    .notNull(),
  depositId: uuid('deposit_id').references(() => studentStoreDeposits.id),
  type: storeTxTypeEnum('type').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  issuedTo: varchar('issued_to', { length: 150 }),
  recordedBy: uuid('recorded_by')
    .references(() => users.id)
    .notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  content: text('content'),
  category: newsCategoryEnum('category').notNull().default('General'),
  status: newsStatusEnum('status').notNull().default('Published'),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gallery = pgTable('gallery', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  category: galleryCategoryEnum('category').notNull(),
  imageUrl: text('image_url').notNull(),
  publicId: text('public_id'),
  date: text('date').notNull(),
  published: boolean('published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const downloads = pgTable('downloads', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: downloadsCategoryEnum('category').notNull(),
  fileSize: text('file_size').notNull(),
  fileFormat: text('file_format').notNull(),
  downloadUrl: text('download_url').notNull(),
  filePath: text('file_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sender: text('sender').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  category: contactMessageCategoryEnum('category')
    .notNull()
    .default('Other Inquiries'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: contactMessageStatusEnum('status').notNull().default('New'),
  replyMessage: text('reply_message'),
  repliedAt: timestamp('replied_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// -----------------------
// -------RELATIONSHIPS ---------///
//------------

export const usersRelations = relations(users, ({ many }) => ({
  payments: many(payments),
  inventoryTransactions: many(inventoryTransactions),
  inspectedRequirementChecks: many(studentRequirementChecks),
  receivedStoreDeposits: many(studentStoreDeposits),
  recordedStoreTransactions: many(storeTransactions),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  students: many(students),
  requirementItems: many(requirementItems),
}));

export const applicationsRelations = relations(applications, ({ many }) => ({
  documents: many(applicationDocuments),
}));

export const applicationDocumentsRelations = relations(
  applicationDocuments,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationDocuments.applicationId],
      references: [applications.id],
    }),
  }),
);

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  payments: many(payments),
  requirementChecks: many(studentRequirementChecks),
  storeDeposits: many(studentStoreDeposits),
  requirementNote: one(studentRequirementNotes, {
    fields: [students.id],
    references: [studentRequirementNotes.studentId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  recordedByUser: one(users, {
    fields: [payments.recordedBy],
    references: [users.id],
  }),
}));

export const inventoryItemsRelations = relations(
  inventoryItems,
  ({ many }) => ({
    transactions: many(inventoryTransactions),
  }),
);

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    item: one(inventoryItems, {
      fields: [inventoryTransactions.itemId],
      references: [inventoryItems.id],
    }),
    recordedByUser: one(users, {
      fields: [inventoryTransactions.recordedBy],
      references: [users.id],
    }),
  }),
);

export const requirementItemsRelations = relations(
  requirementItems,
  ({ one, many }) => ({
    class: one(classes, {
      fields: [requirementItems.classId],
      references: [classes.id],
    }),
    checks: many(studentRequirementChecks),
    storeDeposits: many(studentStoreDeposits),
  }),
);

export const studentRequirementChecksRelations = relations(
  studentRequirementChecks,
  ({ one }) => ({
    student: one(students, {
      fields: [studentRequirementChecks.studentId],
      references: [students.id],
    }),
    item: one(requirementItems, {
      fields: [studentRequirementChecks.requirementItemId],
      references: [requirementItems.id],
    }),
    inspector: one(users, {
      fields: [studentRequirementChecks.inspectedBy],
      references: [users.id],
    }),
  }),
);

export const studentRequirementNotesRelations = relations(
  studentRequirementNotes,
  ({ one }) => ({
    student: one(students, {
      fields: [studentRequirementNotes.studentId],
      references: [students.id],
    }),
  }),
);

export const storeItemsRelations = relations(storeItems, ({ many }) => ({
  deposits: many(studentStoreDeposits),
  transactions: many(storeTransactions),
}));

export const studentStoreDepositsRelations = relations(
  studentStoreDeposits,
  ({ one }) => ({
    student: one(students, {
      fields: [studentStoreDeposits.studentId],
      references: [students.id],
    }),
    storeItem: one(storeItems, {
      fields: [studentStoreDeposits.storeItemId],
      references: [storeItems.id],
    }),
    requirementItem: one(requirementItems, {
      fields: [studentStoreDeposits.requirementItemId],
      references: [requirementItems.id],
    }),
    receivedByUser: one(users, {
      fields: [studentStoreDeposits.receivedBy],
      references: [users.id],
    }),
  }),
);

export const storeTransactionsRelations = relations(
  storeTransactions,
  ({ one }) => ({
    storeItem: one(storeItems, {
      fields: [storeTransactions.storeItemId],
      references: [storeItems.id],
    }),
    deposit: one(studentStoreDeposits, {
      fields: [storeTransactions.depositId],
      references: [studentStoreDeposits.id],
    }),
    recordedByUser: one(users, {
      fields: [storeTransactions.recordedBy],
      references: [users.id],
    }),
  }),
);
export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
  }),
}));
