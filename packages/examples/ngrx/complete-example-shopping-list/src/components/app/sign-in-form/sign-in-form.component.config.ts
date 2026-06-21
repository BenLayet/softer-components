import type { ComponentDef } from "@softer-components/types";
import type { Contract } from "./sign-in-form.component.contract";
import { uiEvents } from "./sign-in-form.component.events";
import { eventForwarders } from "./sign-in-form.component.forwarders";
import { selectors } from "./sign-in-form.component.selectors";
import type { State } from "./sign-in-form.component.state";
import { initialState } from "./sign-in-form.component.state";
import { stateUpdaters } from "./sign-in-form.component.updaters";
import type { ContextsDef, Dependencies } from "./sign-in-form.component.dependencies";

const componentDef = ({
  contextsPath,
}: Dependencies): ComponentDef<Contract, State, ContextsDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  config: { contextsPath },
  eventForwarders,
});

export { componentDef };
