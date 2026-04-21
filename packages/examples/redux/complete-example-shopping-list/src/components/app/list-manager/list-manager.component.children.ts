import { CreateListContract } from "./create-list";
import { ListsContract } from "./lists";

export type Children = {
  lists: ListsContract;
  createList: CreateListContract;
};
