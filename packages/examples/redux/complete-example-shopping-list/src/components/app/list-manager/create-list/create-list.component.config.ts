import { ComponentDef } from "@softer-components/types";

import { Contract } from "./create-list.component.contract";
import { EffectsDependencies, effects } from "./create-list.component.effects";
import { allEvents, uiEvents } from "./create-list.component.events";
import { eventForwarders } from "./create-list.component.forwarders";
import { selectors } from "./create-list.component.selectors";
import { State, initialState } from "./create-list.component.state";
import { stateUpdaters } from "./create-list.component.updaters";

const componentDef = (
  dependencies: EffectsDependencies,
): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  allEvents,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
});

export { componentDef };
