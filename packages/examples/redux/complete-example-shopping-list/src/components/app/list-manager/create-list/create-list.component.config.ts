import type { ComponentDef } from "@softer-components/types";

import type { Contract } from "./create-list.component.contract";
import type { EffectsDependencies } from "./create-list.component.effects";
import { effects } from "./create-list.component.effects";
import { uiEvents } from "./create-list.component.events";
import { eventForwarders } from "./create-list.component.forwarders";
import { selectors } from "./create-list.component.selectors";
import type { State } from "./create-list.component.state";
import { initialState } from "./create-list.component.state";
import { stateUpdaters } from "./create-list.component.updaters";

export const componentDef = (dependencies: EffectsDependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
});
