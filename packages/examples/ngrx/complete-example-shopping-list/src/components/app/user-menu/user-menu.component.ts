import type { ComponentDef } from "@softer-components/types";

import { config } from "./user-menu.component.config";
import type { Contract } from "./user-menu.component.contract";
import type { ContextsDef, Dependencies } from "./user-menu.component.dependencies";
import { uiEvents } from "./user-menu.component.events";
import { eventForwarders } from "./user-menu.component.forwarders";
import { selectors } from "./user-menu.component.selectors";

export const userMenuDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, undefined, ContextsDef> => ({
  selectors,
  uiEvents,
  config: config(dependencies),
  eventForwarders,
});

export type UserMenuContract = Contract;
