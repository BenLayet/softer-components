import {describe, it} from "vitest";
import {counterComponentDef} from "./counter.component";
import {givenRootComponent} from "../../../../../utils/src/test-utilities";

describe("counter.component", () => {
    it("initialState is { count: 0 }", () => {
        givenRootComponent(counterComponentDef)
            .thenExpect( []).count.toBe(0);
    });
    it("when increment is requested then count should be + 1", () => {
        givenRootComponent(counterComponentDef)
            .when({
                name: 'incrementRequested',
                componentPath: []
            })
            .thenExpect( []).count.toBe(1);
    });

    it("when decrement is requested then count should be - 1", () => {
        givenRootComponent(counterComponentDef)
            .when({
                name: 'decrementRequested',
                componentPath: []
            })
            .thenExpect( []).count.toBe(-1);
    });
});
