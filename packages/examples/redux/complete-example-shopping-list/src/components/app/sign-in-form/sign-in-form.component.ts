import type { Contract } from "./sign-in-form.component.contract";
import { View } from "./sign-in-form.component.view";
import type { ComponentDef } from "@softer-components/types";
import type { ContextsDef, Dependencies } from "./sign-in-form.component.dependencies";
import { initialState, type State } from "./sign-in-form.component.state";
import { selectors } from "./sign-in-form.component.selectors";
import { uiEvents } from "./sign-in-form.component.events";
import { stateUpdaters } from "./sign-in-form.component.updaters";
import { eventForwarders } from "./sign-in-form.component.forwarders";
import { config } from "./sign-in-form.component.config";

export const signInFormComponentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State, ContextsDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  config: config(dependencies),
});
export type SignInContract = Contract;
export const SignInForm = View;
