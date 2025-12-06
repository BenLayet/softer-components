import { describe, it } from "vitest";
import { appDef } from "./app.component";
import { givenRootComponent } from "../../../../../utils/src/test-utilities";

const mockEffects = {
  "/listSelect:0/": {
    createNewListRequested: (dispatchers: any, { payload }: any) =>
      dispatchers.createNewListSucceeded({
        name: payload,
        id: "a9212d55-729f-4fa9-ba7a-261c34dd25d9",
        listItems: [],
      }),
  },
};

describe("app.component", () => {
  it("initial list name is empty", () => {
    givenRootComponent(appDef).thenExpect("/listSelect:0/").listName.toBe("");
  });
  it("list name is set", () => {
    givenRootComponent(appDef)
      .when("/listSelect:0/listNameChanged", "My List")
      .thenExpect("/listSelect:0/")
      .listName.toBe("My List");
  });
  it("when listNameChanged then list name should be set", () => {
    givenRootComponent(appDef)
      .withEffects(mockEffects)
      .when("/listSelect:0/createNewListRequested", "My List")
      .and("/list:0/nextItemNameChanged", "Item 1")
      .and("/list:0/itemRows:1/incrementRequested")
      .thenExpect("/list:0/itemRows:1/")
      .quantity.toBe(2);
  });
});
