import {
  ComponentDef,
  ComponentEventsContract,
} from "@softer-components/types";
import { emptyContext } from "@softer-components/utils";

import { List } from "../../model";
import {
  ListManagerContract,
  ListManagerDependencies,
  listManagerDef,
} from "./list-manager/list-manager.component";
import { ListContract, ListDependencies, listDef } from "./list/list.component";
import {
  SignInContract,
  signInFormComponentDef,
} from "./sign-in-form/sign-in-form.component";
import {
  UserContextContract,
  UserContextDependencies,
  userContextDef,
} from "./user-context/user-context.component";
import { UserMenuContract, userMenuDef } from "./user-menu/user-menu.component";

// Events
type eventNames =
  | "listSelected"
  | "selectListRequested"
  | "authenticated"
  | "anonymousChoiceMade"
  | "signInRequested";
type AppEvents = ComponentEventsContract<
  eventNames,
  { listSelected: List; authenticated: { username: string } }
>;

type Contract = {
  events: AppEvents;
  children: {
    userMenu: UserMenuContract & { isOptional: true };
    signInForm: SignInContract & { isOptional: true };
    list: ListContract & { isOptional: true };
    listManager: ListManagerContract & { isOptional: true };
    userContext: UserContextContract;
  };
  values: {};
};
// Component definition
type Dependencies = ListDependencies &
  ListManagerDependencies &
  UserContextDependencies;
const componentDef = (dependencies: Dependencies): ComponentDef<Contract> => {
  const context = emptyContext
    .addContext<"userContext", UserContextContract>("userContext")
    .forChild();
  return {
    updaters: {
      listSelected: ({ children }) => {
        children.list = true;
        children.listManager = false;
      },
      selectListRequested: ({ children }) => {
        children.list = false;
        children.listManager = true;
      },
      authenticated: ({ children }) => {
        children.signInForm = false;
        children.listManager = true;
        children.userMenu = true;
      },
      anonymousChoiceMade: ({ children }) => {
        children.signInForm = false;
        children.listManager = true;
        children.userMenu = true;
      },
      signInRequested: ({ children }) => {
        children.signInForm = true;
        children.listManager = false;
        children.userMenu = false;
        children.list = false;
      },
    },
    initialChildren: { list: false, signInForm: false },
    childrenConfig: {
      listManager: {
        listeners: [
          {
            from: "listSelected",
            to: "listSelected",
          },
        ],
      },
      list: {
        commands: [
          {
            from: "listSelected",
            to: "initialize",
          },
        ],
        listeners: [{ from: "goBackClicked", to: "selectListRequested" }],
      },
      signInForm: {
        listeners: [{ from: "signInCancelled", to: "anonymousChoiceMade" }],
      },
      userMenu: {
        listeners: [
          {
            from: "signInRequested",
            to: "signInRequested",
          },
        ],
      },
      userContext: {
        listeners: [{ from: "signInSucceeded", to: "authenticated" }],
      },
    },
    childrenComponentDefs: {
      userContext: userContextDef(dependencies),
      userMenu: userMenuDef({ context }),
      signInForm: signInFormComponentDef({ context }),
      list: listDef(dependencies),
      listManager: listManagerDef({ dependencies, context }),
    },
  };
};
// Exporting the component definition as a function to allow dependencies injection
export const appDef = componentDef;
export type AppContract = Contract;
export type AppDependencies = Dependencies;
