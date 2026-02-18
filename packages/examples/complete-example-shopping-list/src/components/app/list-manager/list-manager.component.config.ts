import { ComponentDef } from "@softer-components/types";
import { SofterContext } from "@softer-components/utils";

import { ListService } from "../../../port/list.service";
import { UserContextContract } from "../user-context";
import { createListDef } from "./create-list";
import { Contract } from "./list-manager.component.contract";
import {
  childrenConfig,
  eventForwarders,
} from "./list-manager.component.forwarders";
import { selectors } from "./list-manager.component.selectors";
import { listsDef } from "./lists";

type Dependencies = { listService: ListService };

// Component definition
export const componentDef = ({
  dependencies,
  context,
}: {
  dependencies: Dependencies;
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract> => ({
  selectors,
  eventForwarders,
  childrenConfig,
  childrenComponentDefs: {
    lists: listsDef({ dependencies, context: context.forChild() }),
    createList: createListDef(dependencies),
  },
});
