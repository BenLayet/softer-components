import { Actions, USER_PROVIDED_EFFECTS } from "@ngrx/effects";
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
    {
      provide: USER_PROVIDED_EFFECTS,
      multi: true,
      useFactory: (actions: Actions, store: Store) =>
        new SofterNgrxEffects(
          stateManager,
          softerNgrxConfig.rootComponentDef,
          eventMapper,
          actions,
          store,
          featureSelector,
        ),
      deps: [Actions, Store],
    },
  ];
}

const DEFAULT_SOFTER_FEATURE_NAME = "☁️";
const SOFTER_ACTION_TYPE_PREFIX_SEPARATOR = "/";
