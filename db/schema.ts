import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const passes = sqliteTable('passes', {
  id: text('id').primaryKey(), owner: text('owner').notNull(),
  name: text('name').notNull(), email: text('email').notNull(),
  token: text('token').notNull().unique(), code: text('code').notNull().unique(),
  demo: integer('demo').notNull().default(0),
  created: text('created').notNull(), checkedIn: text('checked_in'),
  redeemed: text('redeemed'), redeemedBy: text('redeemed_by'),
  university: text('university').notNull().default(''),
  lunchToken: text('lunch_token').unique(), lunchCode: text('lunch_code').unique(),
  registered: text('registered'), contactIssue: integer('contact_issue').notNull().default(0),
}, t => [uniqueIndex('owner_email').on(t.owner, t.email)]);
export const eventSettings = sqliteTable('event_settings', { key:text('key').primaryKey(), value:text('value').notNull() });

export const mailOutbox = sqliteTable('mail_outbox', { id:text('id').primaryKey(), passId:text('pass_id').notNull().unique(), status:text('status').notNull().default('pending'), created:text('created').notNull(), sent:text('sent'), attempts:integer('attempts').notNull().default(0), error:text('error') });

export const staffUsers=sqliteTable('staff_users',{id:text('id').primaryKey(),email:text('email').notNull().unique(),passwordHash:text('password_hash').notNull(),salt:text('salt').notNull(),singleton:integer('singleton').notNull().unique()});
export const staffSessions=sqliteTable('staff_sessions',{tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull(),expires:integer('expires').notNull()});
export const loginLimits=sqliteTable('login_limits',{key:text('key').primaryKey(),bucket:integer('bucket').notNull(),attempts:integer('attempts').notNull()});
