import type { CreateListContract } from "./create-list/create-list.component";
import type { ListsContract } from "./lists/lists.component";

export type Children = {
  lists: ListsContract;
  createList: CreateListContract;
};
