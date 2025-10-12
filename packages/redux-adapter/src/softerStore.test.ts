import { describe, it, expect } from "vitest";

import { configureSofterStore } from './softerStore';
import { ComponentDef } from '@softer-components/types';

describe('configureSofterStore', () => {
    it('should create a store with initial state from component map', () => {

        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type S = typeof initialState;
        const rootComponentDef: ComponentDef<S, any, any, any> = {
            initialState,
            stateUpdaters: {
                incrementRequested: (state, payload) => ({ count: state.count + payload }),
            },
        };
        //WHEN the store is configured
        const store = configureSofterStore(rootComponentDef);

        //THEN the store should have the initial state
        expect(store.getState()).toHaveProperty('/');
        const state = store.getState()['/'] as S;
        expect(state.count).toBe(0);
    });

    it('should handle state updater actions', () => {

        //GIVEN a root component definition with initial state and state updaters
        const initialState = { count: 0 };
        type S = typeof initialState;
        const rootComponentDef: ComponentDef<S, any, any, any> = {
            initialState,
            stateUpdaters: {
                incrementRequested: (state, payload) => ({ count: state.count + payload }),
            },
        };
        //AND a store configured with the component definition
        const store = configureSofterStore(rootComponentDef);

        //WHEN an incrementRequested event is dispatched
        store.dispatch({ type: '/incrementRequested', payload: 5 });

        //THEN the state should be updated accordingly
        const state = store.getState()['/'] as S;
        expect(state.count).toBe(5);

        //WHEN another incrementRequested event is dispatched
        store.dispatch({ type: '/incrementRequested', payload: 3 });

        //THEN the state should be updated accordingly
        const updatedState = store.getState()['/'] as S;
        expect(updatedState.count).toBe(8);
    });

    it('should handle nested component state and actions', () => {

        //GIVEN a child component definition with initial state and state updaters
        const childInitialState = { value: '' };
        type ChildS = typeof childInitialState;
        const childComponentDef: ComponentDef<ChildS, any, any, any> = {
            initialState: childInitialState,
            stateUpdaters: {
                setValue: (_state, payload) => ({ value: payload }),
            },
        };

        //GIVEN a root component definition with initial state, state updaters and the child component as dependency
        const rootInitialState = { count: 0 };
        type RootS = typeof rootInitialState;
        const rootComponentDef: ComponentDef<RootS, any, any, any> = {
            initialState: rootInitialState,
            stateUpdaters: {
                incrementRequested: (state, payload) => ({ count: state.count + payload }),
            },
            dependencies: {
                children: {
                    child: childComponentDef,
                },
            },
        };

        //AND a store configured with the root component definition
        const store = configureSofterStore(rootComponentDef);

        //THEN the store should have both root and child initial states
        expect(store.getState()).toHaveProperty('/');
        expect(store.getState()).toHaveProperty('/child/');
        const rootState = store.getState()['/'] as RootS;
        expect(rootState.count).toBe(0);
        const childState = store.getState()['/child/'] as ChildS;
        expect(childState.value).toBe('');

        //WHEN an incrementRequested event is dispatched to the root component
        store.dispatch({ type: '/incrementRequested', payload: 4 });

        //THEN only the root state should be updated
        const updatedRootState = store.getState()['/'] as RootS;
        expect(updatedRootState.count).toBe(4);
        const unchangedChildState = store.getState()['/child/'] as ChildS;
        expect(unchangedChildState.value).toBe('');

        //WHEN a setValue event is dispatched to the child component
        store.dispatch({ type: '/child/setValue', payload: 'hello' });

        //THEN only the child state should be updated
        const unchangedRootState = store.getState()['/'] as RootS;
        expect(unchangedRootState.count).toBe(4);
        const updatedChildState = store.getState()['/child/'] as ChildS;
        expect(updatedChildState.value).toBe('hello');
    });

    it('should handle event forwarders', () => {

        //GIVEN a root component definition with initial state, state updaters and event forwarders
        const initialState = { count: 0 };
        type RootComponentState = typeof initialState;
        const selectors = {
            count: (state: RootComponentState) => state.count,
            isEven: (state: RootComponentState) => state.count % 2 === 0,
        };
        type RootSelectors = typeof selectors;
        type RootPayloadRecords = {
            incrementRequested: number;
            timesTwoRequested: void;
        }
        const rootComponentDef: ComponentDef<RootComponentState, RootSelectors, RootPayloadRecords, any> = {
            initialState,
            stateUpdaters: {
                incrementRequested: (state, payload) => ({ count: state.count + payload }),
                timesTwoRequested: (state) => ({ count: state.count * 2 }),
            },
            selectors: {
                count: (state) => state.count,
                isEven: (state) => state.count % 2 === 0,
            },
            eventForwarders: [
                {
                    onEvent: 'incrementRequested',
                    thenDispatch: 'timesTwoRequested',
                    onCondition: (state) => state.count < 20,
                },
            ],
        };

        //AND a store configured with the component definition
        const store = configureSofterStore(rootComponentDef);

        //WHEN an incrementRequested event is dispatched that meets the onCondition
        store.dispatch({ type: '/incrementRequested', payload: 2 });

        //THEN both the incrementRequested and timesTwoRequested updaters should be applied
        let state = store.getState()['/'] as RootComponentState;
        expect(state.count).toBe(4); // 0 + 2 * 2

        //WHEN an incrementRequested event is dispatched that does not meet the onCondition
        store.dispatch({ type: '/incrementRequested', payload: 20 });

        //THEN only the incrementRequested updater should be applied
        state = store.getState()['/'] as RootComponentState;
        expect(state.count).toBe(24); // 4 + 20 (no additional *2 since count is now 24 which is not < 20)

        //WHEN another timesTwoRequested event is dispatched that meets the onCondition
        store.dispatch({ type: '/timesTwoRequested' });

        //THEN only the timesTwoRequested updater should be applied
        state = store.getState()['/'] as RootComponentState;
        expect(state.count).toBe(48); // 24 * 2
    });
});