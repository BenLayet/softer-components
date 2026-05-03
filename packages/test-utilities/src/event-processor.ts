import {
  ContextEventManager,
  EffectsManager,
  SofterEvent,
  StateManager,
  StateTree,
  generateEventsToForward,
  updateSofterRootState,
} from "@softer-components/base-adapter";
import { ComponentDef } from "@softer-components/types";

export interface EventProcessorListener {
  stateUpdated: (event: SofterEvent, stateAfter: StateTree) => void;
}

export const whenEventOccurs = (
  rootState: StateTree, //mutable
  rootComponentDef: ComponentDef,
  stateManager: StateManager,
  effectsManager: EffectsManager,
  contextEventManager: ContextEventManager,
  listener?: EventProcessorListener,
) => {
  const processEvent = async (softerEvent: SofterEvent): Promise<void> => {
    //reducer
    updateSofterRootState(
      rootState,
      rootComponentDef,
      softerEvent,
      stateManager,
    );
    listener?.stateUpdated(softerEvent, rootState);

    //event forwarding
    const newEvents = generateEventsToForward(
      rootState,
      rootComponentDef,
      softerEvent,
      stateManager,
      contextEventManager,
    );

    // Process the whole event chain recursively before processing effects,
    // to ensure the state is fully updated before any effect runs
    const promises = newEvents.map(processEvent);

    //effects
    const effectsPromise = effectsManager.eventOccurred(
      softerEvent,
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
