import type { ComponentDef } from "@softer-components/types";

import { config } from "./sign-in-form.component.config";
import type { Contract } from "./sign-in-form.component.contract";
import type { ContextsDef, Dependencies } from "./sign-in-form.component.dependencies";
import { uiEvents } from "./sign-in-form.component.events";
import { eventForwarders } from "./sign-in-form.component.forwarders";
import { selectors } from "./sign-in-form.component.selectors";
import { initialState, type State } from "./sign-in-form.component.state";
import { stateUpdaters } from "./sign-in-form.component.updaters";

export const signInFormComponentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State, ContextsDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  config: config(dependencies),
  eventForwarders,
});

export type SignInContract = Contract;
