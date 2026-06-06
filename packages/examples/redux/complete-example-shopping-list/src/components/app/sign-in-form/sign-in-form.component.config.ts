import type { ComponentDef } from "@softer-components/types";

import { type UserContextDef, type UserContextPath } from "../user-context/user-context.component";
import type { Contract } from "./sign-in-form.component.contract";
import { uiEvents } from "./sign-in-form.component.events";
import { contextsConfig } from "./sign-in-form.component.forwarders";
import { selectors } from "./sign-in-form.component.selectors";
import type { State } from "./sign-in-form.component.state";
import { initialState } from "./sign-in-form.component.state";
import { stateUpdaters } from "./sign-in-form.component.updaters";

const componentDef = ({
  contextsPath,
}: {
  contextsPath: UserContextPath;
}): ComponentDef<Contract, State, UserContextDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  contextsConfig,
  contextsPath,
});

export { componentDef };
