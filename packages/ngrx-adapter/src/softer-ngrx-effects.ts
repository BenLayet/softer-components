import { Actions, createEffect } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { MemoizedSelector, Store } from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import {
  ContextEventManager,
  EffectsManager,
  GlobalEvent,
  StateTree,
  TreeStateManager,
  generateEventsToForward,
} from "@softer-components/utils";
import { from } from "rxjs";
import { filter, map, switchMap, tap } from "rxjs/operators";

import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";

/**
 * NgRx Effects for softer-components.
 * - Forwards events based on component forwarders
 * - Calls softer effects when events occur
 */
export class SofterNgrxEffects {
  private readonly effectsManager: EffectsManager;
  private readonly contextEventManager: ContextEventManager;
  private readonly dispatchEvent: (newEvent: GlobalEvent) => void;

  constructor(
    private readonly stateManager: TreeStateManager,
    private readonly rootComponentDef: ComponentDef,
    private readonly eventMapper: SofterNgrxEventMapper,
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly featureSelector: MemoizedSelector<object, StateTree>,
  ) {
    this.effectsManager = new EffectsManager(
      rootComponentDef,
      this.stateManager,
    );
    this.contextEventManager = new ContextEventManager(
      rootComponentDef,
      this.stateManager,
    );
    this.dispatchEvent = (newEvent: GlobalEvent) => {
      this.store.dispatch(this.eventMapper.softerEventToNgRxAction(newEvent));
    };
  }

  /**
   * Effect that forwards events based on component forwarders.
   * Listens for softer-component actions and dispatches new actions based on the forwarders.
   */
  forwardEvents$ = createEffect(() =>
    this.actions$.pipe(
      filter(this.eventMapper.isSofterAction),
      map(this.eventMapper.ngrxActionToSofterEvent),
      concatLatestFrom(() => this.store.select(this.featureSelector)),
      map(([event, softerRootState]) =>
        generateEventsToForward(
          softerRootState,
          this.rootComponentDef,
          event,
          this.stateManager,
          this.contextEventManager,
        ),
      ),
      map(events => events.map(this.eventMapper.softerEventToNgRxAction)),
      switchMap(from),
    ),
  );

  /**
   * Effect that calls softer effects when events occur.
   */
  callEffects$ = createEffect(
    () =>
      this.actions$.pipe(
        filter(this.eventMapper.isSofterAction),
        map(this.eventMapper.ngrxActionToSofterEvent),
        concatLatestFrom(() => this.store.select(this.featureSelector)),
        tap(([event, softerRootState]) =>
          this.effectsManager.eventOccurred(
            event,
            softerRootState,
            this.dispatchEvent,
          ),
        ),
      ),
    { dispatch: false },
  );
}
