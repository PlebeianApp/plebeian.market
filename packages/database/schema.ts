import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

const standardColumns = {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
};

export const users = sqliteTable("users", {
  ...standardColumns,
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "editor", "pleb"] }).notNull(),
  displayName: text("display_name").notNull(),
  about: text("about").notNull(),
  image: text("image"),
  banner: text("banner"),
  nip05: text("nip05"),
  lud06: text("lud06"),
  lud16: text("lud16"),
  website: text("website"),
  zapService: text("zap_Service"),
  lastLogin: integer("last_login", { mode: "timestamp" }),
});

export const stalls = sqliteTable("stalls", {
  ...standardColumns,
  name: text("name").notNull(),
  description: text("description").notNull(),
  currency: text("currency").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export const userRelations = relations(users, ({ many }) => ({
  stalls: many(stalls),
}));

export const stallRelations = relations(stalls, ({ one }) => ({
  user: one(users, {
    fields: [stalls.userId],
    references: [users.id],
  }),
}));
