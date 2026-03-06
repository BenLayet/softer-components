import { ComponentDef } from "@softer-components/types";
import { SofterContext } from "@softer-components/utils";

import { UserContextContract } from "../../user-context";
import { Contract } from "./lists.component.contract";
import { EffectsDependencies, effects } from "./lists.component.effects";
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
  uiEvents: ["listClicked", "deleteClicked"],
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
  contextDefs: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
  contextsConfig,
});
