import { inject, Injectable } from "@angular/core";
import { Actions, createEffect } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import {
  ContextEventManager,
  EffectsManager,
  GlobalEvent,
  generateEventsToForward,
} from "@softer-components/utils";
import {  from } from "rxjs";
import { filter, map,  switchMap, tap } from "rxjs/operators";

import {
  SOFTER_EVENT_MAPPER,
  SOFTER_FEATURE_SELECTOR,
  SOFTER_ROOT_COMPONENT_DEF,
  SOFTER_STATE_MANAGER,
} from "./softer-ngrx-config";

/**
 * NgRx Effects for softer-components.
 * - Forwards events based on component forwarders
 * - Calls softer effects when events occur
 */
@Injectable()
export class SofterNgrxEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly stateManager = inject(SOFTER_STATE_MANAGER);
  private readonly rootComponentDef = inject(SOFTER_ROOT_COMPONENT_DEF);
  private readonly eventMapper = inject(SOFTER_EVENT_MAPPER);
  private readonly featureSelector = inject(SOFTER_FEATURE_SELECTOR);

  private readonly effectsManager: EffectsManager;
  private readonly contextEventManager: ContextEventManager;
  private readonly dispatchEvent: (newEvent: GlobalEvent) => void;

  constructor() {
    this.effectsManager = new EffectsManager(
      this.rootComponentDef,
      this.stateManager,
    );
    this.contextEventManager = new ContextEventManager(
      this.rootComponentDef,
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
      switchMap(actions => from(actions)),
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
