import { Store } from "@ngrx/store";
import { ComponentDef, Payload } from "@softer-components/types";
import {
  INPUTTED_BY_USER,
  findComponentDefFromStatePath,
  stringToStatePath,
} from "@softer-components/utils";

import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";

/**
 * Service that creates and caches NgRx action dispatchers for softer components.
 * Given a state path, it gets or creates a set of actions that can be dispatched
 * to update the state of the tree of softer component states in the NgRx store.
 */
export class SofterNgrxDispatchers {
  constructor(
    private readonly rootComponentDef: ComponentDef,
    private readonly store: Store,
    private readonly eventMapper: SofterNgrxEventMapper,
  ) {}

  public createDispatchers(
    statePathStr: string,
  ): Record<string, (payload?: Payload) => void> {
    const statePath = stringToStatePath(statePathStr);
    const componentDef = findComponentDefFromStatePath(
      this.rootComponentDef,
      statePath,
    );
    const uiEvents: readonly string[] =
      typeof componentDef?.uiEvents === "object" ? componentDef.uiEvents : [];

    return Object.fromEntries(
      uiEvents.map(eventName => [
        eventName,
        (payload?: Payload) =>
          this.store.dispatch(
            this.eventMapper.softerEventToNgRxAction({
              statePath,
              name: eventName,
              payload,
              source: INPUTTED_BY_USER,
            }),
          ),
      ]),
    );
  }
}
