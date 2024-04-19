import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { stalls, users } from "./schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Stall = InferSelectModel<typeof stalls>;
export type NewStall = InferInsertModel<typeof stalls>;
