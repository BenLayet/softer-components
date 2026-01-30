import {
  ComponentDef,
  ComponentEventsContract,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { List } from "../../../model";
import { createListDef } from "./create-list/create-list.component";
import { listsDef } from "./lists/lists.component";

// Children components definition
const childrenComponents = {
  lists: listsDef,
  createList: createListDef,
};
type ChildrenContract = ExtractComponentChildrenContract<
  typeof childrenComponents
>;

// Initial state definition
const initialState = {};
type State = typeof initialState;

const selectors = {
  listCount: (_, children) => children.lists.values.listCount(),
  hasAnyList: (_, children) => children.lists.values.listCount() > 0,
} satisfies Selectors<State, ChildrenContract>;

// Events type declaration
type eventNames =
  | "displayed"
  | "emptyListCreated"
  | "listSelected"
  | "listNamesChanged";

type ListSelectEvents = ComponentEventsContract<
  eventNames,
  {
    emptyListCreated: List;
    listSelected: List;
    listNamesChanged: string[];
  }
>;

export type ListSelectContract = {
  state: State;
  values: ExtractComponentValuesContract<typeof selectors>;
  events: ListSelectEvents;
  children: ChildrenContract;
};

// Component definition
export const listSelectDef: ComponentDef<ListSelectContract> = {
  selectors,
  uiEvents: ["displayed"],
  eventForwarders: [
    {
      from: "emptyListCreated",
      to: "listSelected",
    },
  ],
  childrenComponentDefs: childrenComponents,
  childrenConfig: {
    lists: {
      commands: [{ from: "displayed", to: "initializeRequested" }],
      listeners: [
        { from: "listSelected", to: "listSelected" },
        { from: "listNamesChanged", to: "listNamesChanged" },
      ],
    },
    createList: {
      commands: [
        {
          from: "listNamesChanged",
          to: "setExistingListNames",
        },
      ],
      listeners: [{ from: "createNewListSucceeded", to: "emptyListCreated" }],
    },
  },
};
