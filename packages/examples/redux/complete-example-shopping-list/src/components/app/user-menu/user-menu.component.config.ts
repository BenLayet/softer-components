import { ComponentDef } from "@softer-components/types";
import { SofterContext } from "@softer-components/utils";

import { UserContextContract } from "../user-context";
import { Contract } from "./user-menu.component.contract";
import { uiEvents } from "./user-menu.component.events";
import { contextsConfig } from "./user-menu.component.forwarders";
import { selectors } from "./user-menu.component.selectors";

export const componentDef = ({
  context,
}: {
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract> => ({
  selectors,
  uiEvents,
  contextsConfig,
  contextDefs: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
});
