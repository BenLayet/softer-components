import type { ComponentDef, StatePathString } from "@softer-components/types";

import type { AuthenticationService } from "../../port/authentication.service";
import type { ListService } from "../../port/list.service";
import type { Contract } from "./app.component.contract";
import { uiEvents } from "./app.component.events";
import { eventForwarders } from "./app.component.forwarders";
import { selectors } from "./app.component.selectors";
import type { State } from "./app.component.state";
import { initialState } from "./app.component.state";
import { stateUpdaters } from "./app.component.updaters";
import { listDef } from "./list/list.component";
import { listManagerDef } from "./list-manager/list-manager.component";
import { signInFormComponentDef } from "./sign-in-form/sign-in-form.component";
import type {
  userContextSymbol} from "./user-context/user-context.component";
import {
  type UserContextContract,
  userContextDef
} from "./user-context/user-context.component";
import { userMenuDef } from "./user-menu/user-menu.component";

type Dependencies = {
  authenticationService: AuthenticationService;
  listService: ListService;
};

export const componentDef = ({
  dependencies,
  contextsPath,
}: {
  dependencies: Dependencies;
  contextsPath: {
    [userContextSymbol]: StatePathString<UserContextContract>;
  };
}): ComponentDef<Contract, State> => {
  return {
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    eventForwarders,
    config: {
      childrenDefs: {
        userContext: userContextDef(dependencies),
        userMenu: userMenuDef({ contextsPath }),
        signInForm: signInFormComponentDef({ contextsPath }),
        list: listDef(dependencies),
        listManager: listManagerDef({ dependencies, contextsPath }),
      },
    },
  };
};
