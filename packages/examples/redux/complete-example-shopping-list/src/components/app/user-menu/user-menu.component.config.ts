import type { ComponentDef } from "@softer-components/types";

import { type UserContextDef, type UserContextPath } from "../user-context/user-context.component";
import type { Contract } from "./user-menu.component.contract";
import { uiEvents } from "./user-menu.component.events";
import { eventForwarders } from "./user-menu.component.forwarders";
import { selectors } from "./user-menu.component.selectors";

export const componentDef = ({
  contextsPath,
}: {
  contextsPath: UserContextPath;
}): ComponentDef<Contract, undefined, UserContextDef> => ({
  selectors,
  uiEvents,
  contextsPath,
  eventForwarders,
});
