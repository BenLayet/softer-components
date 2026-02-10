import { ComponentDef } from "@softer-components/types";

import { EffectsManager } from "../effects-manager";
import { generateEventsToForward } from "../event-forwarding";
import { GlobalEvent } from "../global-event";
import { updateSofterRootState } from "../reducer";
import { StateManager } from "../state-manager";
import { StateTree } from "../state-tree";

export interface EventProcessorListener {
  stateUpdated: (event: GlobalEvent, stateAfter: StateTree) => void;
}

export const whenEventOccurs = (
  rootState: StateTree, //mutable
  rootComponentDef: ComponentDef,
  stateManager: StateManager,
  effectsManager: EffectsManager<any>,
  listener?: EventProcessorListener,
) => {
  const processEvent = async (globalEvent: GlobalEvent): Promise<void> => {
    //reducer
    updateSofterRootState(
      rootState,
      rootComponentDef,
      globalEvent,
      stateManager,
    );
    listener?.stateUpdated(globalEvent, rootState);

    //event forwarding
    const newEvents = generateEventsToForward(
      rootState,
      rootComponentDef,
      globalEvent,
      stateManager,
    );

    // Process the whole event chain recursively before processing effects,
    // to ensure the state is fully updated before any effect runs
    const promises = newEvents.map(processEvent);

    //effects
    const effectsPromise = effectsManager.eventOccurred(
      globalEvent,
      rootState,
      processEvent,
    );

    // Useful for testing to wait for all events and effects to be processed before making assertions
    // In production, we don't need to wait for the effects to finish before processing the next event,
    // so we can just return immediately
    return Promise.all([...promises, effectsPromise]).then();
  };
  return processEvent;
};
