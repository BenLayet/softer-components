import { InjectionToken } from "@angular/core";
import { provideEffects } from "@ngrx/effects";
import {
  MemoizedSelector,
  Store,
  createFeatureSelector,
  provideState,
} from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import { StateTree, TreeStateManager } from "@softer-components/utils";

import { SofterNgrxDispatchers } from "./softer-ngrx-dispatchers";
import { SofterNgrxEffects } from "./softer-ngrx-effects";
import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";
import { createSofterReducer } from "./softer-ngrx-reducer";
import { SofterNgrxSelectors } from "./softer-ngrx-selectors";

export type SofterNgrxConfig = {
  rootComponentDef: ComponentDef;
  softerFeatureName?: string;
};

// Injection tokens for SofterNgrxEffects dependencies
export const SOFTER_ROOT_COMPONENT_DEF = new InjectionToken<ComponentDef>('SOFTER_ROOT_COMPONENT_DEF');
export const SOFTER_EVENT_MAPPER = new InjectionToken<SofterNgrxEventMapper>('SOFTER_EVENT_MAPPER');
export const SOFTER_STATE_MANAGER = new InjectionToken<TreeStateManager>('SOFTER_STATE_MANAGER');
export const SOFTER_FEATURE_SELECTOR = new InjectionToken<MemoizedSelector<object, StateTree>>('SOFTER_FEATURE_SELECTOR');

export function provideSofterState(softerNgrxConfig: SofterNgrxConfig) {
  const stateManager = new TreeStateManager();
  const softerFeatureName =
    softerNgrxConfig.softerFeatureName ?? DEFAULT_SOFTER_FEATURE_NAME;
  const eventMapper = new SofterNgrxEventMapper(
    softerFeatureName + SOFTER_ACTION_TYPE_PREFIX_SEPARATOR,
  );
  const featureSelector = createFeatureSelector(
    softerFeatureName,
  ) as MemoizedSelector<object, StateTree>;
  return [
    // Provide injection tokens for effects
    { provide: SOFTER_ROOT_COMPONENT_DEF, useValue: softerNgrxConfig.rootComponentDef },
    { provide: SOFTER_EVENT_MAPPER, useValue: eventMapper },
    { provide: SOFTER_STATE_MANAGER, useValue: stateManager },
    { provide: SOFTER_FEATURE_SELECTOR, useValue: featureSelector },
    // Register effects
    provideEffects(SofterNgrxEffects),
    {
      provide: SofterNgrxDispatchers,
      useFactory: (store: Store) =>
        new SofterNgrxDispatchers(
          softerNgrxConfig.rootComponentDef,
          store,
          eventMapper,
        ),
      deps: [Store],
    },
    {
      provide: SofterNgrxSelectors,
      useFactory: () =>
        new SofterNgrxSelectors(
          stateManager,
          softerNgrxConfig.rootComponentDef,
          featureSelector,
        ),
    },
    provideState(
      softerFeatureName,
      createSofterReducer(
        stateManager,
        softerNgrxConfig.rootComponentDef,
        eventMapper,
      ),
    ),
  ];
}

const DEFAULT_SOFTER_FEATURE_NAME = "☁️";
const SOFTER_ACTION_TYPE_PREFIX_SEPARATOR = "/";
