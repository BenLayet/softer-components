import type { SofterContext } from "@softer-components/app-utilities";
import type { ComponentDef } from "@softer-components/types";

import type { UserContextContract } from "../../user-context";
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
  context,
}: {
  dependencies: EffectsDependencies;
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
  contextsDef: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
  contextsConfig,
});
