import { ComponentDef } from "@softer-components/types";
import { emptyContext } from "@softer-components/utils";

import { AuthenticationService } from "../../port/authentication.service";
import { ListService } from "../../port/list.service";
import { Contract } from "./app.component.contract";
import { uiEvents } from "./app.component.events";
import { childrenConfig } from "./app.component.forwarders";
import { selectors } from "./app.component.selectors";
import { State, initialState } from "./app.component.state";
import { updaters } from "./app.component.updaters";
import { listDef } from "./list";
import { listManagerDef } from "./list-manager";
import { signInFormComponentDef } from "./sign-in-form";
import { UserContextContract, userContextDef } from "./user-context";
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
    updaters,
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
