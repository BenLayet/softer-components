import type { SofterTestEvent } from "@softer-components/test-utilities";
import { eventSequenceFactory, stringToStatePath } from "@softer-components/test-utilities";

import type { AppContract } from "../src/components/app/app.component";

export const LIST_MANAGER = `/listManager`;
export const CREATE_LIST = `${LIST_MANAGER}/createList`;
export const LIST = `/list`;
export const FIRST_ITEM = `${LIST}/itemRows:0`;
export const USER_MENU = `/userMenu`;
export const SIGN_IN_FORM = `/signInForm`;

export const USER_SETS_LIST_NAME = eventSequenceFactory<AppContract, string>()
  .atPath(CREATE_LIST)
  .events("listNameChanged");
export const USER_SUBMITS_NEW_LIST = eventSequenceFactory<AppContract>()
  .atPath(CREATE_LIST)
  .events("createNewListSubmitted");
export const USER_SETS_NEXT_ITEM_NAME = eventSequenceFactory<AppContract, string>()
  .atPath(LIST)
  .events("nextItemNameChanged");
export const USER_SUBMITS_NEW_ITEM = eventSequenceFactory<AppContract>()
  .atPath(LIST)
  .events("newItemSubmitted");
export const USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM = eventSequenceFactory<AppContract>()
  .atPath(FIRST_ITEM)
  .events("incrementRequested");
export const USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM = eventSequenceFactory<AppContract>()
  .atPath(FIRST_ITEM)
  .events("decrementRequested");
export const USER_CREATES_NEW_LIST = (name: string) => [
  ...USER_SETS_LIST_NAME(name),
  ...USER_SUBMITS_NEW_LIST(),
];
export const USER_CREATES_NEW_ITEM = (name: string) => [
  ...USER_SETS_NEXT_ITEM_NAME(name),
  ...USER_SUBMITS_NEW_ITEM(),
];

export const USER_SIGNS_IN = eventSequenceFactory<
  AppContract,
  {
    username: string;
    password: string;
  }
>()
  .atPath(USER_MENU)
  .events("goToSignInFormRequested")
  .thenAtPath(SIGN_IN_FORM)
  .events("usernameChanged")
  .withPayloads((input) => input.username)
  .thenAtPath(SIGN_IN_FORM)
  .events("passwordChanged")
  .withPayloads((input) => input.password)
  .thenAtPath(SIGN_IN_FORM)
  .events("signInFormSubmitted");

export const USER_SIGNS_OUT = (): SofterTestEvent[] => [
  {
    name: "signOutRequested",
    statePath: stringToStatePath(USER_MENU),
  },
];
