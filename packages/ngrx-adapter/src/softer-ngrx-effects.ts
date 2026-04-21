import { inject } from "@angular/core";
import { Actions, createEffect } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { MemoizedSelector, Store } from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import {
  ContextEventManager,
  EffectsManager,
  StateTree,
  TreeStateManager,
  generateEventsToForward,
} from "@softer-components/utils";
import { from } from "rxjs";
import { filter, map, switchMap, tap } from "rxjs/operators";

import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";

export const createNgrxEffectThatForwardsSofterEvents = (
  rootComponentDef: ComponentDef,
  eventMapper: SofterNgrxEventMapper,
  stateManager: TreeStateManager,
  softerRootStateSelector: MemoizedSelector<object, StateTree>,
  contextEventManager: ContextEventManager,
) =>
  createEffect(
    (actions$ = inject(Actions), store = inject(Store)) => {
      return actions$.pipe(
        filter(eventMapper.isSofterAction),
        map(eventMapper.ngrxActionToSofterEvent),
        concatLatestFrom(() => store.select(softerRootStateSelector)),
        map(([event, softerRootState]) =>
          generateEventsToForward(
            softerRootState,
            rootComponentDef,
            event,
            stateManager,
            contextEventManager,
          ),
        ),
        map(events => events.map(eventMapper.softerEventToNgRxAction)),
        switchMap(actions => from(actions)),
      );
    },
    { functional: true },
  );

export const createNgrxEffectThatCallsSofterEffects = (
  eventMapper: SofterNgrxEventMapper,
  softerRootStateSelector: MemoizedSelector<object, StateTree>,
  effectsManager: EffectsManager,
) =>
  createEffect(
    (actions$ = inject(Actions), store = inject(Store)) => {
      const dispatchEvent = (
        newEvent: Parameters<typeof eventMapper.softerEventToNgRxAction>[0],
      ) => {
        store.dispatch(eventMapper.softerEventToNgRxAction(newEvent));
      };

      return actions$.pipe(
        filter(eventMapper.isSofterAction),
        map(eventMapper.ngrxActionToSofterEvent),
        concatLatestFrom(() => store.select(softerRootStateSelector)),
        tap(([event, softerRootState]) =>
          effectsManager.eventOccurred(event, softerRootState, dispatchEvent),
        ),
      );
    },
    { functional: true, dispatch: false },
  );
