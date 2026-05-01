import { SofterContext } from "@softer-components/base-adapter";
import { ComponentDef } from "@softer-components/types";

import { UserContextContract } from "../../user-context";
import { Contract } from "./lists.component.contract";
import { EffectsDependencies, effects } from "./lists.component.effects";
import { allEvents, uiEvents } from "./lists.component.events";
import { contextsConfig, eventForwarders } from "./lists.component.forwarders";
import { selectors } from "./lists.component.selectors";
import { State, initialState } from "./lists.component.state";
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
  allEvents,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
  contextsDef: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
  contextsConfig,
});
