import { ActionReducer } from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import {
  SofterRootState,
  StateManager,
  initializeRootState,
  updateSofterRootState,
} from "@softer-components/utils";
import { produce } from "immer";

import {
  NgRxAction,
  NgrxGlobalState,
  actionToEvent,
  addSofterRootTree,
  getSofterRootTree,
  isSofterAction,
} from "./softer-mappers";

/**
 * Creates the softer reducer for NgRx.
 * Uses Immer for immutable state updates.
 */
export function createSofterReducer<FeatureName extends string>(
  stateManager: StateManager,
  rootComponentDef: ComponentDef,
  featureName: FeatureName,
): ActionReducer<SofterRootState, NgRxAction> {
  // Initialize the root state
  const initialState: SofterRootState = {};
  const globalState = addSofterRootTree(initialState as NgrxGlobalState);
  initializeRootState(
    getSofterRootTree(globalState, featureName),
    rootComponentDef,
    stateManager,
  );

  return (
    state: SofterRootState | undefined,
    action: NgRxAction,
  ): SofterRootState => {
    //TODO : is this necessary?
    if (state === undefined) {
      return getSofterRootTree(globalState);
    }

    if (!isSofterAction(action)) {
      return state;
    }

    // Use Immer's produce for immutable state updates
    return produce(state, (draftState: SofterRootState) => {
      const globalEvent = actionToEvent(action);
      updateSofterRootState(
        draftState,
        rootComponentDef,
        globalEvent,
        stateManager,
      );
    });
  };
}
