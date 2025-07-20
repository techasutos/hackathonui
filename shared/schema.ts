import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // MEMBER, TREASURER, PRESIDENT, ADMIN
  description: text("description"),
  permissions: json("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  foundedDate: timestamp("founded_date"),
  isActive: boolean("is_active").default(true),
  totalFund: decimal("total_fund", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Members table
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  roleId: integer("role_id").references(() => roles.id),
  name: text("name").notNull(),
  aadhaar: text("aadhaar").unique(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  gender: text("gender"),
  dateOfBirth: timestamp("date_of_birth"),
  isApproved: boolean("is_approved").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Savings deposits table
export const savingDeposits = pgTable("saving_deposits", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id),
  groupId: integer("group_id").references(() => groups.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  remarks: text("remarks"),
  depositDate: timestamp("deposit_date").defaultNow(),
  receiptNumber: text("receipt_number"),
});

// Loan applications table
export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id),
  groupId: integer("group_id").references(() => groups.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  purposeDetails: text("purpose_details"),
  tenure: integer("tenure"), // in months
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }),
  status: text("status").default("PENDING"), // PENDING, APPROVED, DISBURSED, REPAID, REJECTED
  appliedDate: timestamp("applied_date").defaultNow(),
  approvedDate: timestamp("approved_date"),
  approvedBy: integer("approved_by").references(() => members.id),
  disbursedDate: timestamp("disbursed_date"),
  disbursedBy: integer("disbursed_by").references(() => members.id),
});

// Loan repayments table
export const loanRepayments = pgTable("loan_repayments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loanApplications.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  repaymentDate: timestamp("repayment_date").defaultNow(),
  remarks: text("remarks"),
  receiptNumber: text("receipt_number"),
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id),
  title: text("title").notNull(),
  description: text("description"),
  meetingDate: timestamp("meeting_date").notNull(),
  location: text("location"),
  agenda: json("agenda").$type<string[]>().default([]),
  attendees: json("attendees").$type<number[]>().default([]),
  createdBy: integer("created_by").references(() => members.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Polls table
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id),
  title: text("title").notNull(),
  description: text("description"),
  options: json("options").$type<string[]>().notNull(),
  votes: json("votes").$type<Record<string, number[]>>().default({}),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => members.id),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// SDG mappings table
export const sdgMappings = pgTable("sdg_mappings", {
  id: serial("id").primaryKey(),
  keywords: json("keywords").$type<string[]>().notNull(),
  sdgGoal: integer("sdg_goal").notNull(), // 1-17
  goalTitle: text("goal_title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SDG impact tracking table
export const sdgImpacts = pgTable("sdg_impacts", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id),
  sdgGoal: integer("sdg_goal").notNull(),
  impactType: text("impact_type").notNull(), // JOBS_CREATED, WOMEN_EMPOWERED, SAVINGS_GROWTH
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  relatedEntityType: text("related_entity_type"), // LOAN, DEPOSIT
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  permissions: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  location: true,
  foundedDate: true,
});

export const insertMemberSchema = createInsertSchema(members).pick({
  userId: true,
  groupId: true,
  roleId: true,
  name: true,
  aadhaar: true,
  phone: true,
  email: true,
  address: true,
  gender: true,
  dateOfBirth: true,
});

export const insertSavingDepositSchema = createInsertSchema(savingDeposits).pick({
  memberId: true,
  groupId: true,
  amount: true,
  remarks: true,
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).pick({
  memberId: true,
  groupId: true,
  amount: true,
  purpose: true,
  purposeDetails: true,
  tenure: true,
  monthlyIncome: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  groupId: true,
  title: true,
  description: true,
  meetingDate: true,
  location: true,
  agenda: true,
  createdBy: true,
});

export const insertPollSchema = createInsertSchema(polls).pick({
  groupId: true,
  title: true,
  description: true,
  options: true,
  createdBy: true,
});

export const insertSDGMappingSchema = createInsertSchema(sdgMappings).pick({
  keywords: true,
  sdgGoal: true,
  goalTitle: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type SavingDeposit = typeof savingDeposits.$inferSelect;
export type InsertSavingDeposit = z.infer<typeof insertSavingDepositSchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type LoanRepayment = typeof loanRepayments.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type SDGMapping = typeof sdgMappings.$inferSelect;
export type InsertSDGMapping = z.infer<typeof insertSDGMappingSchema>;
export type SDGImpact = typeof sdgImpacts.$inferSelect;
