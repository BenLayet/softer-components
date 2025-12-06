import { describe, it } from "vitest";
import { appDef } from "./app.component";
import { givenRootComponent } from "@softer-components/utils/test-utilities";

describe("app.component", () => {
  it("initial list name is empty", () => {
    givenRootComponent(appDef)
      .thenExpectComponentAtPath("/listSelect:0/")
      .listName.toBe("");
  });
  it("when increment is requested then count should be + 1", () => {
    givenRootComponent(appDef)
      .whenEventOccurs("/listSelect:0/listNameChanged", "My List")
      .thenExpectComponentAtPath("/listSelect:0/")
      .listName.toBe("My List");
  });
});
