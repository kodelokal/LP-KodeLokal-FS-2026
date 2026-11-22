import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", [
  "CEO",
  "CTO",
  "PM",
  "MARKETING",
  "ADMIN",
  "WORKER",
  "CLIENT",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "INQUIRY",
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
]);

export const projectPriorityEnum = pgEnum("project_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "NEW",
  "CONTACTED",
  "PROPOSAL",
  "CONVERTED",
  "ARCHIVED",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
]);

// ============================================================================
// AUTH & RBAC TABLES
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("WORKER"),
  title: text("title").notNull().default("Tim KodeLokal"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// CMS TABLES (LANDING PAGE CONTENT)
// ============================================================================

export type SiteSocialLinks = {
  instagram?: string;
  github?: string;
  linkedin?: string;
  tiktok?: string;
};

export type SiteStatItem = {
  label: string;
  value: string;
};

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  brandName: text("brand_name").notNull().default("KodeLokal"),
  tagline: text("tagline").notNull().default("Mitra Digital Anda"),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroCtaPrimary: text("hero_cta_primary").notNull().default("Mulai Project Sekarang"),
  heroCtaSecondary: text("hero_cta_secondary").notNull().default("Lihat Portofolio"),
  aboutTitle: text("about_title").notNull(),
  aboutDescription: text("about_description").notNull(),
  whatsappNumber: text("whatsapp_number").notNull().default("6281234567890"),
  contactEmail: text("contact_email").notNull().default("halo@kodelokal.store"),
  officeAddress: text("office_address").notNull().default("Indonesia — Remote-First Digital Studio"),
  socialLinks: jsonb("social_links").$type<SiteSocialLinks>().notNull().default({}),
  stats: jsonb("stats").$type<SiteStatItem[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  startingPrice: text("starting_price").notNull().default("Mulai Rp 3,5 Jt"),
  iconName: text("icon_name").notNull().default("Code2"),
  accentColor: text("accent_color").notNull().default("blue"), // 'blue' | 'orange'
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  category: text("category").notNull().default("Web App"),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  techStack: jsonb("tech_stack").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url").notNull(),
  liveUrl: text("live_url"),
  projectYear: integer("project_year").notNull().default(2026),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  roleCode: userRoleEnum("role_code").notNull().default("WORKER"),
  positionTitle: text("position_title").notNull(),
  department: text("department").notNull().default("Engineering"),
  parentId: uuid("parent_id").references((): AnyPgColumn => teamMembers.id, {
    onDelete: "set null",
  }),
  bio: text("bio").notNull().default(""),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  avatarUrl: text("avatar_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  isOpenPosition: boolean("is_open_position").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientName: text("client_name").notNull(),
  clientRole: text("client_role").notNull(),
  companyName: text("company_name").notNull(),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  avatarUrl: text("avatar_url"),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
});

// ============================================================================
// CLIENT PROJECT MANAGEMENT & INQUIRIES
// ============================================================================

export const clientProjects = pgTable("client_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  trackingCode: text("tracking_code").notNull().unique(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientCompany: text("client_company"),
  clientPhone: text("client_phone"),
  serviceCategory: text("service_category").notNull().default("Web App"),
  status: projectStatusEnum("status").notNull().default("PLANNING"),
  priority: projectPriorityEnum("priority").notNull().default("MEDIUM"),
  progress: integer("progress").notNull().default(0),
  budget: text("budget"),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  repositoryUrl: text("repository_url"),
  stagingUrl: text("staging_url"),
  notes: text("notes"),
  leadPmId: uuid("lead_pm_id").references(() => users.id, { onDelete: "set null" }),
  isPublicTracking: boolean("is_public_tracking").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectMilestones = pgTable("project_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => clientProjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("TODO"),
  dueDate: date("due_date"),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  serviceInterest: text("service_interest").notNull().default("Web App"),
  budgetRange: text("budget_range"),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").notNull().default("NEW"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// DRIZZLE RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  managedProjects: many(clientProjects),
  assignedMilestones: many(projectMilestones),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const clientProjectsRelations = relations(clientProjects, ({ one, many }) => ({
  leadPm: one(users, {
    fields: [clientProjects.leadPmId],
    references: [users.id],
  }),
  milestones: many(projectMilestones),
}));

export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(clientProjects, {
    fields: [projectMilestones.projectId],
    references: [clientProjects.id],
  }),
  assignee: one(users, {
    fields: [projectMilestones.assigneeId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type ProjectPriority = (typeof projectPriorityEnum.enumValues)[number];
export type InquiryStatus = (typeof inquiryStatusEnum.enumValues)[number];
export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type ClientProject = typeof clientProjects.$inferSelect;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
