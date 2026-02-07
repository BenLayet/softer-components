import { givenRootComponent } from "@softer-components/utils/test-utilities";
import { describe, it } from "vitest";

import { appDef } from "../src/components/app/app.component";
import {
  CREATE_LIST,
  FIRST_ITEM,
  LIST,
  USER_CREATES_NEW_ITEM,
  USER_CREATES_NEW_LIST,
  USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM,
  USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM,
  USER_SETS_LIST_NAME,
} from "./app.component.steps";
import { mockDependencies } from "./mock-dependencies";

describe("app.component", () => {
  it("initial list name is empty", () => {
    givenRootComponent(appDef(mockDependencies([])))
      .thenExpect(CREATE_LIST)
      .listName.toBe("");
  });
  it("list name is set", () => {
    givenRootComponent(appDef(mockDependencies([])))
      .when(USER_SETS_LIST_NAME("Groceries"))
      .thenExpect(CREATE_LIST)
      .listName.toBe("Groceries");
  });
  it("list is created", () => {
    givenRootComponent(appDef(mockDependencies([])))
      .when(USER_CREATES_NEW_LIST("Groceries"))
      .thenExpect(LIST)
      .listName.toBe("Groceries");
  });
  it("when one list and one item are created, and quantity is incremented, quantity of first item should be 2", () => {
    givenRootComponent(appDef(mockDependencies([])))
      .when(USER_CREATES_NEW_LIST("Groceries"))
      .and(USER_CREATES_NEW_ITEM("milk"))
      .and(USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM())
      .thenExpect(FIRST_ITEM)
      .quantity.toBe(2);
  });
  it("when list, and item are created, and quantity is decremented, item should be removed", () => {
    givenRootComponent(appDef(mockDependencies([])))
      .when(USER_CREATES_NEW_LIST("Groceries"))
      .and(USER_CREATES_NEW_ITEM("milk"))
      .and(USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM())
      .thenExpect(FIRST_ITEM)
      .toBeUndefined();
  });
});
