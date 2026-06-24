import type { Contract } from "./list-manager.component.contract";
import { View } from "./list-manager.component.view";
import type { ComponentDef } from "@softer-components/types";
import type { Dependencies } from "./list-manager.component.dependencies";
import { selectors } from "./list-manager.component.selectors";
import { eventForwarders } from "./list-manager.component.forwarders";
import { config } from "./list-manager.component.config";

export const listManagerDef = (dependencies: Dependencies): ComponentDef<Contract> => ({
  selectors,
  eventForwarders,
  config: config(dependencies),
});
export type ListManagerContract = Contract;
export const ListManager = View;
