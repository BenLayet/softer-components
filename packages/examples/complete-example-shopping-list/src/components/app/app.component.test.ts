import { describe, it } from "vitest";
import { appDef } from "./app.component";
import { givenRootComponent } from "../../../../../utils/src/test-utilities";

describe("app.component", () => {
  it("initial list name is empty", () => {
    givenRootComponent(appDef)
      .thenExpectComponentAtPath("/listSelect:0/")
      .listName.toBe("");
  });
  it("when listNameChanged then list name should be set", () => {
    givenRootComponent(appDef)
      .whenEventOccurs("/listSelect:0/listNameChanged", "My List")
      .thenExpectComponentAtPath("/listSelect:0/")
      .listName.toBe("My List");
  });
});
