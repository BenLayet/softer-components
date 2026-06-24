import type { Contract } from "./app.component.contract";
import { View } from "./app.component.view";
import type { Dependencies } from "./app.component.dependencies";
import { config } from "./app.component.config";
import { eventForwarders } from "./app.component.forwarders";
import type { ComponentDef } from "@softer-components/types";
import { initialState, type State } from "./app.component.state";
import { selectors } from "./app.component.selectors";
import { uiEvents } from "./app.component.events";
import { stateUpdaters } from "./app.component.updaters";

export const appDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  config: config(dependencies),
});

export type AppContract = Contract;
export const App = View;
