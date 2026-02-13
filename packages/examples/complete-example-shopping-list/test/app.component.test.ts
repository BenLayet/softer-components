import {
  TestStore,
  initTestStore,
} from "@softer-components/utils/test-utilities";
import { describe, expect, it } from "vitest";

import { AppContract, appDef } from "../src/components/app/app.component";
import {
  CREATE_LIST,
  FIRST_ITEM,
  LIST,
  USER_CREATES_NEW_ITEM,
  USER_CREATES_NEW_LIST,
  USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM,
  USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM,
  USER_MENU,
  USER_SETS_LIST_NAME,
  USER_SIGNS_IN,
  USER_SIGNS_OUT,
} from "./app.component.steps";
import { mockDependencies } from "./mock-dependencies";

describe("app.component", () => {
  let testStore: TestStore<AppContract>;
  beforeEach(() => {
    testStore = initTestStore(appDef(mockDependencies([])));
  });
  it("initial list name is empty", () => {
    expect(testStore.getValues(CREATE_LIST).listName()).toBe("");
  });
  it("list name is set", async () => {
    await testStore.when(USER_SETS_LIST_NAME("Groceries"));
    expect(testStore.getValues(CREATE_LIST).listName()).toBe("Groceries");
  });
  it("list is created", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    expect(testStore.getValues(LIST).name()).toBe("Groceries");
  });
  it("when one list and one item are created, and quantity is incremented, quantity of first item should be 2", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    await testStore.and(USER_CREATES_NEW_ITEM("milk"));
    await testStore.and(USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM());
    expect(testStore.getValues(FIRST_ITEM).quantity()).toBe(2);
  });
  it("when list, and item are created, and quantity is decremented, item should be removed", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    await testStore.and(USER_CREATES_NEW_ITEM("milk"));
    await testStore.and(USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM());
    expect(testStore.isStateDefined(FIRST_ITEM)).toBe(false);
  });

  it("initial user is anonymous", () => {
    expect(testStore.getValues("/userMenu").isAnonymous()).toBe(true);
  });
  it("when user signs in successfully, her name should be displayed", async () => {
    await testStore.when(USER_SIGNS_IN("alice", "demo"));
    expect(testStore.getValues(USER_MENU).username()).toBe("alice");
  });
  it("when user signs in and out successfully, her name should not be displayed", async () => {
    await testStore.when(USER_SIGNS_IN("alice", "demo"));
    await testStore.and(USER_SIGNS_OUT());
    expect(testStore.getValues(USER_MENU).username()).toBe("");
  });
});
