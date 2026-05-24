import type { CreateListContract } from "./create-list";
import type { ListsContract } from "./lists";

export type Children = {
  lists: ListsContract;
  createList: CreateListContract;
};
