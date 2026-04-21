import { List } from "../model";

export interface ListService {
  create(name: string): Promise<List>;
  getAll(): Promise<List[]>;
  delete(listId: string): Promise<void>;
  save(list: List): Promise<void>;
}
