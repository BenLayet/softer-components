import type { ComponentDef } from "@softer-components/types";
import type { SofterContext } from "@softer-components/app-utilities";

import type { UserContextContract } from "../user-context/user-context.component";
import type { Contract } from "./sign-in-form.component.contract";
import { uiEvents } from "./sign-in-form.component.events";
import { contextsConfig } from "./sign-in-form.component.forwarders";
import { selectors } from "./sign-in-form.component.selectors";
import type { State} from "./sign-in-form.component.state";
import { initialState } from "./sign-in-form.component.state";
import { stateUpdaters } from "./sign-in-form.component.updaters";

const componentDef = ({
  context,
}: {
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  contextsConfig,
  contextsDef: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
});

export { componentDef };
