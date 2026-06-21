import type { ComponentDef } from "@softer-components/types";

import { config } from "./list-manager.component.config";
import type { Contract } from "./list-manager.component.contract";
import type { Dependencies } from "./list-manager.component.dependencies";
import { eventForwarders } from "./list-manager.component.forwarders";
import { selectors } from "./list-manager.component.selectors";

export const listManagerDef = (dependencies: Dependencies): ComponentDef<Contract> => ({
  selectors,
  eventForwarders,
  config: config(dependencies),
});

export type ListManagerContract = Contract;
