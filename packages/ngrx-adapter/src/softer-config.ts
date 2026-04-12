import { Actions, USER_PROVIDED_EFFECTS } from "@ngrx/effects";
import { Store, provideState } from "@ngrx/store";
import { ComponentDef } from "@softer-components/types";
import { TreeStateManager } from "@softer-components/utils";

import { NGRX_SOFTER_PREFIX } from "./softer-mappers";
import { SofterNgrxDispatchers } from "./softer-ngrx-dispatchers";
import { SofterNgrxEffects } from "./softer-ngrx-effects";
import { createSofterReducer } from "./softer-ngrx-reducer";
import { SofterNgrxSelectors } from "./softer-ngrx-selectors";

export type SofterNgrxConfig = {
  rootComponentDef: ComponentDef;
  softerFeatureName?: string;
};
export function provideSofterState(softerNgrxConfig: SofterNgrxConfig) {
  const stateManager = new TreeStateManager();
  const softerFeatureName =
    softerNgrxConfig.softerFeatureName ?? NGRX_SOFTER_PREFIX;
  return [
    {
      provide: SofterNgrxDispatchers,
      useFactory: (store: Store) =>
        new SofterNgrxDispatchers(softerNgrxConfig.rootComponentDef, store),
      deps: [Store],
    },
    {
      provide: SofterNgrxSelectors,
      useFactory: () =>
        new SofterNgrxSelectors(
          stateManager,
          softerNgrxConfig.rootComponentDef,
          softerFeatureName,
        ),
    },
    provideState(
      softerFeatureName,
      createSofterReducer(stateManager, softerNgrxConfig.rootComponentDef),
    ),
    {
      provide: USER_PROVIDED_EFFECTS,
      multi: true,
      useFactory: (actions: Actions, store: Store) =>
        new SofterNgrxEffects(
          stateManager,
          softerNgrxConfig.rootComponentDef,
          actions,
          store,
        ),
      deps: [Actions, Store],
    },
  ];
}
