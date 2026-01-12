import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentChildrenContract,
} from "@softer-components/types";

import { List } from "../../model";
import { listSelectDef } from "./list-select/list-select.component.ts";
import { listDef } from "./list/list.component.ts";

// Events
type eventNames = "listSelected" | "selectListRequested";
type AppEvents = ComponentEventsContract<eventNames, { listSelected: List }>;
const childrenComponentDefs = {
  listSelect: listSelectDef,
  list: listDef,
};

export type AppComponentContract = {
  state: undefined;
  events: AppEvents;
  children: ExtractComponentChildrenContract<typeof childrenComponentDefs> & {
    list: { isOptional: true };
    listSelect: { isOptional: true };
  };
  values: {};
};
// Component definition
export const appDef: ComponentDef<AppComponentContract> = {
  updaters: {
    listSelected: ({ children }) => {
      children.list = true;
      children.listSelect = false;
    },
    selectListRequested: ({ children }) => {
      children.list = false;
      children.listSelect = true;
    },
  },
  initialChildren: { list: false },
  childrenComponentDefs,
  childrenConfig: {
    list: {
      commands: [{ from: "listSelected", to: "initialize" }],
      listeners: [{ from: "goBackClicked", to: "selectListRequested" }],
    },
    listSelect: {
      listeners: [
        {
          from: "listSelected",
          to: "listSelected",
        },
      ],
    },
  },
};
