import type { ComponentDefConfig } from "@softer-components/types";

import { createListDef } from "./create-list/create-list.component";
import type { Contract } from "./list-manager.component.contract";
import type { Dependencies } from "./list-manager.component.dependencies";
import { listsDef } from "./lists/lists.component";

export const config = (dependencies: Dependencies): ComponentDefConfig<Contract> => ({
  childrenDefs: {
    lists: listsDef(dependencies),
    createList: createListDef({ services: dependencies.services }),
  },
});
