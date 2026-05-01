import { SofterContext } from "@softer-components/app-utilities";
import { ComponentDef } from "@softer-components/types";

import { UserContextContract } from "../user-context";
import { Contract } from "./user-menu.component.contract";
import { allEvents, uiEvents } from "./user-menu.component.events";
import { contextsConfig } from "./user-menu.component.forwarders";
import { selectors } from "./user-menu.component.selectors";

export const componentDef = ({
  context,
}: {
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract> => ({
  selectors,
  allEvents,
  uiEvents,
  contextsConfig,
  contextsDef: {
    userContext: context.getRelativePath<UserContextContract>("userContext"),
  },
});
