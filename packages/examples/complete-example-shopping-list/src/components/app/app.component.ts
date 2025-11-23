import {
  ComponentDef,
  CreateComponentChildrenContract,
} from "@softer-components/types";
import { List } from "../../model/List.ts";
import { listSelectDef } from "../list-select/list-select.component.ts";
import { listDef } from "../list/list.component.ts";
// Events
type AppEvents = {
  listSelected: { payload: List };
  backClicked: { payload: undefined };
};
const childrenComponents = {
  listSelect: listSelectDef,
  list: listDef,
};

export type AppComponentContract = {
  state: undefined;
  events: AppEvents;
  children: CreateComponentChildrenContract<typeof childrenComponents>;
  values: {};
};
// Component definition
export const appDef: ComponentDef<AppComponentContract> = {
  uiEvents: ["backClicked"],
  updaters: {
    listSelected: ({ childrenNodes }) => {
      childrenNodes.list = true;
      childrenNodes.listSelect = false;
    },
    backClicked: ({ childrenNodes }) => {
      childrenNodes.list = false;
      childrenNodes.listSelect = true;
    },
  },
  initialChildrenNodes: { listSelect: true, list: false },
  childrenComponents,
  childrenConfig: {
    list: { commands: [{ from: "listSelected", to: "initialize" }] },
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
