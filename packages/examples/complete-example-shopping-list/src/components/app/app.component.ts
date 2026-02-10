import {
  ComponentDef,
  ComponentEventsContract,
} from "@softer-components/types";

import { List } from "../../model";
import { AuthenticationService } from "../../port/authenticationService";
import {
  ListManagerContract,
  ListManagerDependencies,
  listManagerDef,
} from "./list-manager/list-manager.component";
import { ListContract, ListDependencies, listDef } from "./list/list.component";
import {
  LoginContract,
  LoginDependencies,
  loginComponentDef,
} from "./login/login.component";
import { UserMenuContract, userMenuDef } from "./user-menu/user-menu.component";

// Events
type eventNames =
  | "listSelected"
  | "selectListRequested"
  | "authenticated"
  | "anonymousChoiceMade"
  | "loginRequested"
  | "logoutRequested";
type AppEvents = ComponentEventsContract<
  eventNames,
  { listSelected: List; authenticated: { username: string } }
>;

type Contract = {
  events: AppEvents;
  children: {
    userMenu: UserMenuContract & { isOptional: true };
    login: LoginContract & { isOptional: true };
    list: ListContract & { isOptional: true };
    listManager: ListManagerContract & { isOptional: true };
  };
  values: {};
};
// Component definition
type Dependencies = ListDependencies &
  ListManagerDependencies &
  LoginDependencies & {
    authenticationService: AuthenticationService;
  };
const componentDef = (dependencies: Dependencies): ComponentDef<Contract> => ({
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
      children.login = false;
      children.listManager = true;
      children.userMenu = true;
    },
    anonymousChoiceMade: ({ children }) => {
      children.login = false;
      children.listManager = true;
      children.userMenu = true;
    },
    loginRequested: ({ children }) => {
      children.login = true;
      children.listManager = false;
      children.userMenu = false;
      children.list = false;
    },
  },
  initialChildren: { list: false, login: false },
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
    login: {
      listeners: [
        { from: "loginSucceeded", to: "authenticated" },
        { from: "loginCancelled", to: "anonymousChoiceMade" },
      ],
    },
    userMenu: {
      listeners: [
        { from: "logoutSucceeded", to: "anonymousChoiceMade" },
        { from: "loginRequested", to: "loginRequested" },
      ],
      commands: [{ from: "authenticated", to: "authenticated" }],
    },
  },
  childrenComponentDefs: {
    userMenu: userMenuDef(dependencies),
    login: loginComponentDef(dependencies),
    list: listDef(dependencies),
    listManager: listManagerDef(dependencies),
  },
});
// Exporting the component definition as a function to allow dependencies injection
export const appDef = componentDef;
export type AppContract = Contract;
export type AppDependencies = Dependencies;
