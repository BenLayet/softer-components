import { GlobalEvent, stringToStatePath } from "@softer-components/utils";

export const LIST_MANAGER = `/listManager`;
export const CREATE_LIST = `${LIST_MANAGER}/createList`;
export const LISTS = `${LIST_MANAGER}/lists`;
export const LIST = `/list`;
export const FIRST_ITEM = `${LIST}/itemRows:0`;
export const USER_MENU = `/userMenu`;
export const SIGN_IN_FORM = `/signInForm`;

export const USER_SETS_LIST_NAME = (name: string): GlobalEvent[] => [
  {
    payload: name,
    name: "listNameChanged",
    statePath: stringToStatePath(CREATE_LIST),
  },
];
export const USER_SUBMITS_NEW_LIST = (): GlobalEvent[] => [
  {
    name: "createNewListSubmitted",
    statePath: stringToStatePath(CREATE_LIST),
    payload: undefined,
  },
];
export const USER_SETS_NEXT_ITEM_NAME = (name: string): GlobalEvent[] => [
  {
    name: "nextItemNameChanged",
    payload: name,
    statePath: stringToStatePath(LIST),
  },
];
export const USER_SUBMITS_NEW_ITEM = (): GlobalEvent[] => [
  {
    name: "newItemSubmitted",
    statePath: stringToStatePath(LIST),
    payload: undefined,
  },
];
export const USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM = (): GlobalEvent[] => [
  {
    name: "incrementRequested",
    statePath: stringToStatePath(FIRST_ITEM),
    payload: undefined,
  },
];
export const USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM = (): GlobalEvent[] => [
  {
    name: "decrementRequested",
    statePath: stringToStatePath(FIRST_ITEM),
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

export const USER_SIGNS_IN = (
  username: string,
  password: string,
): GlobalEvent[] => [
  {
    name: "signInRequested",
    statePath: stringToStatePath(USER_MENU),
    payload: undefined,
  },
  {
    name: "usernameChanged",
    statePath: stringToStatePath(SIGN_IN_FORM),
    payload: username,
  },
  {
    name: "passwordChanged",
    statePath: stringToStatePath(SIGN_IN_FORM),
    payload: password,
  },
  {
    name: "signInFormSubmitted",
    statePath: stringToStatePath(SIGN_IN_FORM),
    payload: undefined,
  },
];

export const USER_SIGNS_OUT = (): GlobalEvent[] => [
  {
    name: "signOutRequested",
    statePath: stringToStatePath(USER_MENU),
    payload: undefined,
  },
];
