import {
  ComponentDef,
  ComponentEventsContract,
} from "@softer-components/types";

import { List } from "../../model";
import {
  ListManagerContract,
  ListManagerDependencies,
  listManagerDef,
} from "./list-manager/list-manager.component";
import { ListContract, ListDependencies, listDef } from "./list/list.component";

// Events
type eventNames = "listSelected" | "selectListRequested";
type AppEvents = ComponentEventsContract<eventNames, { listSelected: List }>;

type Contract = {
  events: AppEvents;
  children: {
    list: ListContract & { isOptional: true };
    listManager: ListManagerContract & { isOptional: true };
  };
  values: {};
};
// Component definition
type Dependencies = ListDependencies & ListManagerDependencies;

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
  },
  initialChildren: { list: false },
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
  },
  childrenComponentDefs: {
    list: listDef(dependencies),
    listManager: listManagerDef(dependencies),
  },
});
// Exporting the component definition as a function to allow dependencies injection
export const appDef = componentDef;
export type AppContract = Contract;
export type AppDependencies = Dependencies;
