import { provideEffects } from "@ngrx/effects";
import {
  MemoizedSelector,
  Store,
  createFeatureSelector,
  provideState,
} from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import {
  ContextEventManager,
  EffectsManager,
  StateTree,
  TreeStateManager,
} from "@softer-components/utils";

import { SofterNgrxDispatchers } from "./softer-ngrx-dispatchers";
import {
  createNgrxEffectThatCallsSofterEffects,
  createNgrxEffectThatForwardsSofterEvents,
} from "./softer-ngrx-effects";
import { SofterNgrxEventMapper } from "./softer-ngrx-event-mapper";
import { createSofterReducer } from "./softer-ngrx-reducer";
import { SofterNgrxSelectors } from "./softer-ngrx-selectors";

export type SofterNgrxConfig = {
  rootComponentDef: ComponentDef;
  softerFeatureName?: string;
};

export function provideSofterState(softerNgrxConfig: SofterNgrxConfig) {
  const rootComponentDef = softerNgrxConfig.rootComponentDef;
  const stateManager = new TreeStateManager();
  const softerFeatureName =
    softerNgrxConfig.softerFeatureName ?? DEFAULT_SOFTER_FEATURE_NAME;
  const eventMapper = new SofterNgrxEventMapper(softerFeatureName);
  const softerRootStateSelector = createFeatureSelector(
    softerFeatureName,
  ) as MemoizedSelector<object, StateTree>;
  const contextEventManager = new ContextEventManager(
    rootComponentDef,
    stateManager,
  );
  const ngrxEffectThatForwardsSofterEvents =
    createNgrxEffectThatForwardsSofterEvents(
      rootComponentDef,
      eventMapper,
      stateManager,
      softerRootStateSelector,
      contextEventManager,
    );
  const effectsManager = new EffectsManager(rootComponentDef, stateManager);
  const ngrxEffectThatCallsSofterEffects =
    createNgrxEffectThatCallsSofterEffects(
      eventMapper,
      softerRootStateSelector,
      effectsManager,
    );
  return [
    // Register effects
    provideEffects({
      ngrxEffectThatForwardsSofterEvents,
      ngrxEffectThatCallsSofterEffects,
    }),
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
          softerRootStateSelector,
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
