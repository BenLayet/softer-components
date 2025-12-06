import {describe, it} from "vitest";
import {counterComponentDef} from "./counter.component";
import {givenRootComponent} from "@softer-components/utils/test-utilities";

describe("counter.component", () => {
    it("initialState is { count: 0 }", () => {
        givenRootComponent(counterComponentDef)
            .thenExpectComponentAtPath("/").count.toBe(0);
    });
    it("when increment is requested then count should be + 1", () => {
        givenRootComponent(counterComponentDef)
            .whenEventOccurs("/incrementRequested")
            .thenExpectComponentAtPath("/").count.toBe(1);
    });

    it("when decrement is requested then count should be - 1", () => {
        givenRootComponent(counterComponentDef)
            .whenEventOccurs("/decrementRequested")
            .thenExpectComponentAtPath("/").count.toBe(-1);
    });
});
