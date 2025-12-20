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
const childrenComponents = {
  listSelect: listSelectDef,
  list: listDef,
};

export type AppComponentContract = {
  state: undefined;
  events: AppEvents;
  children: ExtractComponentChildrenContract<typeof childrenComponents>;
  values: {};
};
// Component definition
export const appDef: ComponentDef<AppComponentContract> = {
  updaters: {
    listSelected: ({ childrenKeys }) => {
      childrenKeys.list = ["0"];
      childrenKeys.listSelect = [];
    },
    selectListRequested: ({ childrenKeys }) => {
      childrenKeys.list = [];
      childrenKeys.listSelect = ["0"];
    },
  },
  initialChildrenKeys: { listSelect: ["0"], list: [] },
  childrenComponents,
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
