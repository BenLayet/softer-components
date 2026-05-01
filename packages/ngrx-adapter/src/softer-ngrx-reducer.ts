import { ActionReducer } from "@ngrx/store";
import {
  SofterRootState,
  StateManager,
  StateTree,
  initializeRootState,
  updateSofterRootState,
} from "@softer-components/base-adapter";
import { ComponentDef } from "@softer-components/types";
import { produce } from "immer";

import { NgRxAction, SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";

/**
 * Creates the softer reducer for NgRx.
 * Uses Immer for immutable state updates.
 */
export function createSofterReducer(
  stateManager: StateManager,
  rootComponentDef: ComponentDef,
  eventMapper: SofterNgrxEventMapper,
): ActionReducer<StateTree, NgRxAction> {
  // Initialize the root state
  const initialState: SofterRootState = {};
  initializeRootState(initialState, rootComponentDef, stateManager);

  return (state: StateTree | undefined, action: NgRxAction): StateTree => {
    if (state === undefined) {
      return initialState as StateTree;
    }
    if (!eventMapper.isSofterAction(action)) {
      return state;
    }

    // Use Immer's produce for immutable state updates
    return produce(state, (draftState: SofterRootState) => {
      const globalEvent = eventMapper.ngrxActionToSofterEvent(action);
      updateSofterRootState(
        draftState,
        rootComponentDef,
        globalEvent,
        stateManager,
      );
    });
  };
}
