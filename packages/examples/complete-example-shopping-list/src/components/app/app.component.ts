import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentChildrenContract,
} from "@softer-components/types";

import { List } from "../../model";
import { listManagerDef } from "./list-manager/list-manager.component";
import { listDef } from "./list/list.component";

// Events
type eventNames = "listSelected" | "selectListRequested";
type AppEvents = ComponentEventsContract<eventNames, { listSelected: List }>;
const childrenComponentDefs = {
  listManager: listManagerDef,
  list: listDef,
};

export type AppComponentContract = {
  events: AppEvents;
  children: ExtractComponentChildrenContract<typeof childrenComponentDefs> & {
    list: { isOptional: true };
    listManager: { isOptional: true };
  };
  values: {};
};
// Component definition
export const appDef: ComponentDef<AppComponentContract> = {
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
  childrenComponentDefs,
  childrenConfig: {
    list: {
      commands: [
        {
          from: "listSelected",
          to: "initialize",
        },
      ],
      listeners: [{ from: "goBackClicked", to: "selectListRequested" }],
    },
    listManager: {
      listeners: [
        {
          from: "listSelected",
          to: "listSelected",
        },
      ],
    },
  },
};
