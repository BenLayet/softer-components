import { describe, it, expect } from "vitest";

import { configureSofterStore } from "./softer-store";
import { ComponentDef, componentDefBuilder } from "@softer-components/types";

describe("configureSofterStore", () => {
    it("should create a store with initial state", () => {
        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type MyState = typeof initialState;
        const rootComponentDef = componentDefBuilder.initialState(initialState).build();
        //WHEN the store is configured
        const store = configureSofterStore(rootComponentDef);

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty("/");
        const state = store.getState()["/"] as MyState;
        expect(state.count).toBe(0);
    });

    it("should create a store with events", () => {
        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type MyState = typeof initialState;
        const rootComponentDef = componentDefBuilder.initialState(initialState).events({
            incrementRequested: {
                stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
            },
        }).build();
        const store = configureSofterStore(rootComponentDef);

        //WHEN an event is dispatched
        store.dispatch({ type: "/incrementRequested", payload: undefined });

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty("/");
        const state = store.getState()["/"] as MyState;
        expect(state.count).toBe(1);
    });

    it("should create a store with events forwarding", () => {
        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type MyState = typeof initialState;
        const rootComponentDef = componentDefBuilder.initialState(initialState).events<{
            incrementBtnClicked: undefined;
            incrementRequested: undefined;
        }>({
            incrementBtnClicked: {
                forwarders: [{ to: "incrementRequested" }],
            },
            incrementRequested: {
                stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
            },
        }).build();
        const store = configureSofterStore(rootComponentDef);

        //WHEN an event is dispatched
        store.dispatch({ type: "/incrementBtnClicked", payload: undefined });

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty("/");
        const state = store.getState()["/"] as MyState;
        expect(state.count).toBe(1);
    });



    it("should create a store with children", () => {
        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type MyState = typeof initialState;
        const childComponentDef = componentDefBuilder
            .initialState(initialState)
            .events({
                incrementRequested: {
                    stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
                },
            })
            .build();
        const rootComponentDef = componentDefBuilder
            .children({
                child: { componentDef: childComponentDef },
            })
            .build();
        const store = configureSofterStore(rootComponentDef);

        //WHEN an event is dispatched
        store.dispatch({ type: "/child/incrementRequested", payload: undefined });

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty("/child/");
        const state = store.getState()["/child/"] as MyState;
        expect(state.count).toBe(1);
    });

    it("should create a store with children and output", () => {
        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type MyState = typeof initialState;
        const childComponentDef = componentDefBuilder
            .initialState(initialState)
            .events({
                incrementRequested: {
                    stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
                },
            })
            .build();
        const rootComponentDef = componentDefBuilder
            .events({
                incrementBtnClicked: {}
            })
            .children({
                child: { componentDef: childComponentDef },
            })
            .output([
                {
                    onEvent: "incrementBtnClicked",
                    thenDispatch: "child/incrementRequested",
                }
            ])
            .build();
        const store = configureSofterStore(rootComponentDef);

        //WHEN an event is dispatched
        store.dispatch({ type: "/incrementBtnClicked", payload: undefined });

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty("/child/");
        const state = store.getState()["/child/"] as MyState;
        expect(state.count).toBe(1);
    });


    it("should create a store with children and input", () => {
        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type MyState = typeof initialState;
        const childComponentDef = componentDefBuilder
            .events({
                incrementBtnClicked: {}
            })
            .build();
        const rootComponentDef = componentDefBuilder
            .initialState(initialState)
            .events({
                incrementRequested: {
                    stateUpdater: (state) => ({ ...state, count: state.count + 1 }),
                },
            })
            .children({
                child: { componentDef: childComponentDef },
            })
            .input([
                {
                    onEvent: "child/incrementBtnClicked",
                    thenDispatch: "incrementRequested",
                }
            ])
            .build();
        const store = configureSofterStore(rootComponentDef);

        //WHEN an event is dispatched
        store.dispatch({ type: "/child/incrementBtnClicked", payload: undefined });

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty("/");
        const state = store.getState()["/"] as MyState;
        expect(state.count).toBe(1);
    });
});