import {
  TestStore,
  initTestStore,
} from "@softer-components/utils/test-utilities";
import { describe, expect, it } from "vitest";

import { AppContract, appDef } from "../src/components/app/app.component";
import {
  USER_CREATES_NEW_ITEM,
  USER_CREATES_NEW_LIST,
  USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM,
  USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM,
  USER_SETS_LIST_NAME,
} from "./app.component.steps";
import { mockDependencies } from "./mock-dependencies";

describe("app.component", () => {
  let testStore: TestStore<AppContract>;
  beforeEach(() => {
    testStore = initTestStore(appDef(mockDependencies([])));
  });
  it("initial list name is empty", () => {
    expect(testStore.getValues("/listManager/createList").listName()).toBe("");
  });
  it("list name is set", async () => {
    await testStore.when(USER_SETS_LIST_NAME("Groceries"));
    expect(testStore.getValues("/listManager/createList").listName()).toBe(
      "Groceries",
    );
  });
  it("list is created", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    expect(testStore.getValues("/list").name()).toBe("Groceries");
  });
  it("when one list and one item are created, and quantity is incremented, quantity of first item should be 2", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    await testStore.and(USER_CREATES_NEW_ITEM("milk"));
    await testStore.and(USER_INCREMENTS_QUANTITY_OF_FIRST_ITEM());
    expect(testStore.getValues("/list/itemRows:0").quantity()).toBe(2);
  });
  it("when list, and item are created, and quantity is decremented, item should be removed", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    await testStore.and(USER_CREATES_NEW_ITEM("milk"));
    await testStore.and(USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM());
    expect(testStore.isStateDefined("/list/itemRows:0")).toBeFalsy();
  });
  it("when list, and item are created, and quantity is decremented, item should be removed", async () => {
    await testStore.when(USER_CREATES_NEW_LIST("Groceries"));
    await testStore.and(USER_CREATES_NEW_ITEM("milk"));
    await testStore.and(USER_DECREMENTS_QUANTITY_OF_FIRST_ITEM());
    expect(testStore.isStateDefined("/list/itemRows:0")).toBeFalsy();
  });
});
