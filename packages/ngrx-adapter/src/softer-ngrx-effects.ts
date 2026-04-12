import { Actions, createEffect } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import {
  ContextEventManager,
  EffectsManager,
  GlobalEvent,
  TreeStateManager,
  generateEventsToForward,
} from "@softer-components/utils";
import { filter, tap } from "rxjs/operators";

import {
  NgRxAction,
  NgrxGlobalState,
  actionToEvent,
  eventToAction,
  getSofterRootTree,
  isSofterAction,
} from "./softer-mappers";

/**
 * NgRx Effects for softer-components.
 * - Forwards events based on component forwarders
 * - Calls softer effects when events occur
 */
export class SofterNgrxEffects {
  private readonly effectsManager: EffectsManager;
  private readonly contextEventManager: ContextEventManager;

  constructor(
    private readonly stateManager: TreeStateManager,
    private readonly rootComponentDef: ComponentDef,
    private readonly actions$: Actions,
    private readonly store: Store<NgrxGlobalState>,
  ) {
    this.effectsManager = new EffectsManager(
      rootComponentDef,
      this.stateManager,
    );
    this.contextEventManager = new ContextEventManager(
      rootComponentDef,
      this.stateManager,
    );
  }

  /**
   * Effect that forwards events based on component forwarders.
   * Listens for softer-component actions and dispatches new actions based on the forwarders.
   */
  forwardEvents$ = createEffect(
    () =>
      this.actions$.pipe(
        filter(action => isSofterAction(action as NgRxAction)),
        tap(action => {
          const softerRootState = this.getSofterRootState();
          const event = actionToEvent(action as NgRxAction);

          const eventsToForward = generateEventsToForward(
            softerRootState,
            this.rootComponentDef,
            event,
            this.stateManager,
            this.contextEventManager,
          );

          eventsToForward.forEach(forwardedEvent => {
            this.store.dispatch(eventToAction(forwardedEvent));
          });
        }),
      ),
    { dispatch: false },
  );

  /**
   * Effect that calls softer effects when events occur.
   */
  callEffects$ = createEffect(
    () =>
      this.actions$.pipe(
        filter(action => isSofterAction(action as NgRxAction)),
        tap(action => {
          const softerRootState = this.getSofterRootState();
          const event = actionToEvent(action as NgRxAction);

          const dispatchEvent = (newEvent: GlobalEvent) => {
            this.store.dispatch(eventToAction(newEvent));
          };

          void this.effectsManager.eventOccurred(
            event,
            softerRootState,
            dispatchEvent,
          );
        }),
      ),
    { dispatch: false },
  );

  private getSofterRootState() {
    let state: NgrxGlobalState = {};
    this.store
      .select(s => s)
      .subscribe(s => (state = s))
      .unsubscribe();
    return getSofterRootTree(state);
  }
}
