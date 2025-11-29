import {
  ComponentDef,
  ExtractComponentChildrenContract,
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
  children: ExtractComponentChildrenContract<typeof childrenComponents>;
  values: {};
};
// Component definition
export const appDef: ComponentDef<AppComponentContract> = {
  uiEvents: ["backClicked"],
  updaters: {
    listSelected: ({ childrenKeys }) => {
      childrenKeys.list = ["0"];
      childrenKeys.listSelect = [];
    },
    backClicked: ({ childrenKeys }) => {
      childrenKeys.list = [];
      childrenKeys.listSelect = ["0"];
    },
  },
  initialChildrenKeys: { listSelect: [], list: ["0"] },
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
