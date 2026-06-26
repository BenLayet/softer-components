import type { Contract } from "./user-menu.component.contract";
import { View } from "./user-menu.component.view";
import type { Dependencies } from "../app.component.dependencies";
import type { ComponentDef } from "@softer-components/types";
import { uiEvents } from "./user-menu.component.events";
import { eventForwarders } from "./user-menu.component.forwarders";
import { selectors } from "./user-menu.component.selectors";
import { config } from "./user-menu.component.config";

export const userMenuDef = (dependencies: Dependencies): ComponentDef<Contract> => ({
  selectors,
  uiEvents,
  eventForwarders,
  config: config(dependencies),
});
export type UserMenuContract = Contract;
export const UserMenu = View;
