import { config } from "./app.component.config";
import type { Contract } from "./app.component.contract";
import type { Dependencies } from "./app.component.dependencies";
import type { ComponentDef } from "@softer-components/types";
import { initialState, type State } from "./app.component.state";
import { selectors } from "./app.component.selectors";
import { uiEvents } from "./app.component.events";
import { stateUpdaters } from "./app.component.updaters";
import { eventForwarders } from "./app.component.forwarders";

export const appDef = (dependencies: Dependencies): ComponentDef<Contract, State> => {
  return {
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    eventForwarders,
    config: config(dependencies),
  };
};

export type AppContract = Contract;
