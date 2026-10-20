import type { TableName, Tables } from "@/lib/types";

export interface Store {
  all<T extends TableName>(table: T): Promise<Tables[T][]>;
  get<T extends TableName>(table: T, id: string): Promise<Tables[T] | null>;
  upsert<T extends TableName>(table: T, row: Tables[T]): Promise<void>;
  remove(table: TableName, id: string): Promise<void>;
  /** Uploads a file and returns its public URL. */
  upload(file: File): Promise<string>;
}
