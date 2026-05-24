import { emptyContext } from "@softer-components/app-utilities";
import type { ComponentDef } from "@softer-components/types";

import type { AuthenticationService } from "../../port/authentication.service";
import type { ListService } from "../../port/list.service";
import type { Contract } from "./app.component.contract";
import { uiEvents } from "./app.component.events";
import { childrenConfig } from "./app.component.forwarders";
import { selectors } from "./app.component.selectors";
import type { State} from "./app.component.state";
import { initialState } from "./app.component.state";
import { stateUpdaters } from "./app.component.updaters";
import { listDef } from "./list";
import { listManagerDef } from "./list-manager";
import { signInFormComponentDef } from "./sign-in-form";
import type { UserContextContract} from "./user-context";
import { userContextDef } from "./user-context";
import { userMenuDef } from "./user-menu";

type Dependencies = {
  authenticationService: AuthenticationService;
  listService: ListService;
};

export const componentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State> => {
  const context = emptyContext
    .addContext<"userContext", UserContextContract>("userContext")
    .forChild();
  return {
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    childrenConfig,
    childrenComponentDefs: {
      userContext: userContextDef(dependencies),
      userMenu: userMenuDef({ context }),
      signInForm: signInFormComponentDef({ context }),
      list: listDef(dependencies),
      listManager: listManagerDef({ dependencies, context }),
    },
  };
};
