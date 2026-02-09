import { GlobalEvent, stringToStatePath } from "@softer-components/utils";

export const CREATE_LIST = stringToStatePath("/listManager/createList");
export const LIST = stringToStatePath("/list");
export const FIRST_ITEM = stringToStatePath("/list/itemRows:0");
export const USER_SETS_LIST_NAME = (name: string): GlobalEvent[] => [
  {
    payload: name,
    name: "listNameChanged",
    statePath: CREATE_LIST,
  },
];
export const USER_SUBMITS_NEW_LIST = (): GlobalEvent[] => [
  {
    name: "createNewListSubmitted",
    statePath: CREATE_LIST,
    payload: undefined,
  },
];
export const USER_SETS_NEXT_ITEM_NAME = (name: string): GlobalEvent[] => [
  {
    name: "nextItemNameChanged",
    payload: name,
    statePath: LIST,
  },
];
export const USER_SUBMITS_NEW_ITEM = (): GlobalEvent[] => [
  {
    name: "newItemSubmitted",
    statePath: LIST,
    payload: undefined,
  },
];
export const USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM = (): GlobalEvent[] => [
  {
    name: "incrementRequested",
    statePath: FIRST_ITEM,
    payload: undefined,
  },
];
export const USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM = (): GlobalEvent[] => [
  {
    name: "decrementRequested",
    statePath: FIRST_ITEM,
    payload: undefined,
  },
];
export const USER_CREATES_NEW_LIST = (name: string): GlobalEvent[] => [
  ...USER_SETS_LIST_NAME(name),
  ...USER_SUBMITS_NEW_LIST(),
];
export const USER_CREATES_NEW_ITEM = (name: string): GlobalEvent[] => [
  ...USER_SETS_NEXT_ITEM_NAME(name),
  ...USER_SUBMITS_NEW_ITEM(),
];
