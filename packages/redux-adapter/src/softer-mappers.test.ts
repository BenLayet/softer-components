import { describe, expect, it } from "vitest";
import { actionToEvent, eventToAction } from "./softer-mappers";

describe("softer mapper tests", () => {
  it("should convert redux action to softer event", () => {
    //WHEN
    const result = actionToEvent({ type: "☁️/child:0/answered", payload: 42 });

    //THEN
    expect(result).toEqual({
      name: "answered",
      payload: 42,
      componentPath: [["child", "0"]],
    });
  });
  it("should convert softer event to redux action", () => {
    //WHEN
    const result = eventToAction({
      name: "answered",
      payload: 42,
      componentPath: [["child", "0"]],
    });

    //THEN
    expect(result).toEqual({ type: "☁️/child:0/answered", payload: 42 });
  });
});
