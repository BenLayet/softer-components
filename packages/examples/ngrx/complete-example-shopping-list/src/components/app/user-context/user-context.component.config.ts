import { ComponentDef } from "@softer-components/types";

import { AuthenticationService } from "../../../port/authentication.service";
import { Contract } from "./user-context.component.contract";
import { effects } from "./user-context.component.effects";
import { uiEvents } from "./user-context.component.events";
import { eventForwarders } from "./user-context.component.forwarders";
import { selectors } from "./user-context.component.selectors";
import { State, initialState } from "./user-context.component.state";
import { stateUpdaters } from "./user-context.component.updaters";

export const componentDef = (dependencies: {
  authenticationService: AuthenticationService;
}): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  effects: effects(dependencies),
});
