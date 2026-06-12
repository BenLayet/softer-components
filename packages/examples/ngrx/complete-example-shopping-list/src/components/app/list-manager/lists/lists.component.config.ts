import type { ComponentDef } from "@softer-components/types";

import { effects } from "./lists.component.effects";
import { uiEvents } from "./lists.component.events";
import { eventForwarders } from "./lists.component.forwarders";
import { selectors } from "./lists.component.selectors";
import type { State } from "./lists.component.state";
import { initialState } from "./lists.component.state";
import { stateUpdaters } from "./lists.component.updaters";
import type { ContextsDef, Dependencies } from "./lists.component.dependencies";
import type { Contract } from "./lists.component.contract";

export const componentDef = ({
  dependencies,
  contextsPath,
}: Dependencies): ComponentDef<Contract, State, ContextsDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  effects: effects(dependencies),
  contextsPath,
  eventForwarders,
});
