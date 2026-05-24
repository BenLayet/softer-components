import type { ComponentDef } from "@softer-components/types";
import type { SofterContext } from "@softer-components/app-utilities";

import type { UserContextContract } from "../user-context";
import type { Contract } from "./user-menu.component.contract";
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
  contextsDef: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
});
