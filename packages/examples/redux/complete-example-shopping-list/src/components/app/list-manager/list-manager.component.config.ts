import type { ComponentDef } from "@softer-components/types";

import type { ListService } from "../../../port/list.service";
import type { UserContextPath } from "../user-context/user-context.component";
import { createListDef } from "./create-list/create-list.component";
import type { Contract } from "./list-manager.component.contract";
import { childrenConfig, eventForwarders } from "./list-manager.component.forwarders";
import { selectors } from "./list-manager.component.selectors";
import { listsDef } from "./lists/lists.component";

type Dependencies = { listService: ListService };

// Component definition
export const componentDef = ({
  dependencies,
  contextsPath,
}: {
  dependencies: Dependencies;
  contextsPath: UserContextPath;
}): ComponentDef<Contract> => ({
  selectors,
  eventForwarders,
  childrenConfig,
  childrenComponentDefs: {
    lists: listsDef({ dependencies, contextsPath }),
    createList: createListDef(dependencies),
  },
});
