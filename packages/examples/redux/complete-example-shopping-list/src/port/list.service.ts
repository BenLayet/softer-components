import type { List } from "../model";

export type ListService = {
  create(name: string): Promise<List>;
  getAll(): Promise<List[]>;
  delete(listId: string): Promise<void>;
  save(list: List): Promise<void>;
}
