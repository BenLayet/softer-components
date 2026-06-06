import type { ComponentDef } from "@softer-components/types";

import type { UserContextDef, UserContextPath } from "../../user-context/user-context.component";
import type { Contract } from "./lists.component.contract";
import type { EffectsDependencies } from "./lists.component.effects";
import { effects } from "./lists.component.effects";
import { uiEvents } from "./lists.component.events";
import { contextsConfig, eventForwarders } from "./lists.component.forwarders";
import { selectors } from "./lists.component.selectors";
import type { State } from "./lists.component.state";
import { initialState } from "./lists.component.state";
import { stateUpdaters } from "./lists.component.updaters";

export const componentDef = ({
  dependencies,
  contextsPath,
}: {
  dependencies: EffectsDependencies;
  contextsPath: UserContextPath;
}): ComponentDef<Contract, State, UserContextDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
  contextsPath,
  contextsConfig,
});
