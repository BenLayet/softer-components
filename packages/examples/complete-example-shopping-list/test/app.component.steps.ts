import { GlobalEvent, stringToComponentPath } from "@softer-components/utils";

export const CREATE_LIST = stringToComponentPath("/listManager/createList/");
export const LISTS = stringToComponentPath("/listManager/lists");
export const LIST = stringToComponentPath("/list/");
export const FIRST_ITEM = stringToComponentPath("/list/itemRows:0/");
export const USER_SETS_LIST_NAME = (name: string): GlobalEvent[] => [
  {
    payload: name,
    name: "listNameChanged",
    componentPath: CREATE_LIST,
  },
];
export const USER_SUBMITS_NEW_LIST = (): GlobalEvent[] => [
  {
    name: "createNewListSubmitted",
    componentPath: CREATE_LIST,
    payload: undefined,
  },
];
export const USER_SETS_NEXT_ITEM_NAME = (name: string): GlobalEvent[] => [
  {
    name: "nextItemNameChanged",
    payload: name,
    componentPath: LIST,
  },
];
export const USER_SUBMITS_NEW_ITEM = (): GlobalEvent[] => [
  {
    name: "newItemSubmitted",
    componentPath: LIST,
    payload: undefined,
  },
];
export const USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM = (): GlobalEvent[] => [
  {
    name: "incrementRequested",
    componentPath: FIRST_ITEM,
    payload: undefined,
  },
];
export const USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM = (): GlobalEvent[] => [
  {
    name: "decrementRequested",
    componentPath: FIRST_ITEM,
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
